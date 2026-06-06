package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.service.OrderService;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.dto.BookingWindowResponse;
import com.restaurant.platform.modules.reservation.dto.TableAvailabilityResponse;
import com.restaurant.platform.modules.reservation.dto.TimeSlotAvailabilityResponse;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.reservation.mapper.ReservationMapper;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.reservation.service.ReservationService;
import com.restaurant.platform.modules.settings.dto.SettingsDTO;
import com.restaurant.platform.modules.settings.service.SettingsService;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.restaurant.platform.modules.table.mapper.TableMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static com.restaurant.platform.modules.reservation.enums.ReservationStatus.*;
import static com.restaurant.platform.modules.order.enums.OrderStatus.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final ReservationMapper reservationMapper;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TableMapper tableMapper;
    private final UserRepository userRepository;
    private final SettingsService settingsService;
    private final Clock clock;

    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final int MAX_BOOKING_WINDOW_DAYS = 4;

    // Keep interval overlaps blocked only for reservations that still hold the table.
    private static final List<ReservationStatus> BLOCKING_STATUSES = List.of(
            com.restaurant.platform.modules.reservation.enums.ReservationStatus.PENDING,
            ReservationStatus.RESERVED,
            ReservationStatus.CHECKED_IN
    );

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    private SettingsDTO settings() {
        return settingsService.getSettings();
    }

    private int defaultReservationDurationMinutes() {
        Integer configured = settings().getDefaultReservationDuration();
        return configured != null && configured > 0 ? configured : 120;
    }

    private LocalTime openingTime() {
        return LocalTime.parse(settings().getOpeningTime());
    }

    private LocalTime closingTime() {
        return LocalTime.parse(settings().getClosingTime());
    }

    private LocalDateTime businessStart(LocalDate date) {
        return date.atTime(openingTime());
    }

    private LocalDateTime businessEnd(LocalDate date) {
        return date.atTime(closingTime());
    }

    private LocalDate maxBookingDate() {
        return now().toLocalDate().plusDays(MAX_BOOKING_WINDOW_DAYS);
    }

    private List<LocalDateTime> buildBusinessHourSlots(LocalDate date) {
        LocalDateTime start = businessStart(date);
        LocalDateTime end = businessEnd(date);
        List<LocalDateTime> slots = new ArrayList<>();
        for (LocalDateTime slot = start; !slot.isAfter(end); slot = slot.plusMinutes(SLOT_INTERVAL_MINUTES)) {
            slots.add(slot);
        }
        return slots;
    }

    private LocalDateTime roundUpToSlot(LocalDateTime time) {
        LocalDateTime truncated = time.truncatedTo(ChronoUnit.MINUTES);
        int minute = truncated.getMinute();
        int remainder = minute % SLOT_INTERVAL_MINUTES;
        if (remainder == 0 && time.getSecond() == 0 && time.getNano() == 0) {
            return truncated;
        }
        return truncated.plusMinutes(SLOT_INTERVAL_MINUTES - remainder);
    }

    private List<LocalDateTime> buildTodaySlots() {
        return buildSelectableSlots(now());
    }

    private List<LocalDateTime> buildSelectableSlots(LocalDateTime referenceNow) {
        LocalDate currentDate = referenceNow.toLocalDate();
        LocalDateTime start = roundUpToSlot(referenceNow);
        if (start.isBefore(businessStart(currentDate))) {
            start = businessStart(currentDate);
        }
        LocalDateTime end = businessEnd(currentDate);

        if (start.isAfter(end)) {
            return List.of();
        }

        List<LocalDateTime> slots = new ArrayList<>();
        for (LocalDateTime slot = start; !slot.isAfter(end) && slot.toLocalDate().equals(currentDate); slot = slot.plusMinutes(SLOT_INTERVAL_MINUTES)) {
            slots.add(slot);
        }
        return slots;
    }

    private LocalDateTime resolveStartTime(ReservationRequest request) {
        if (request.getStartTime() == null) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        return request.getStartTime();
    }

    private LocalDateTime resolveEndTime(LocalDateTime startTime) {
        LocalDateTime expectedEnd = startTime.plusMinutes(defaultReservationDurationMinutes());
        LocalDateTime windowEnd = businessEnd(startTime.toLocalDate());
        return expectedEnd.isAfter(windowEnd) ? windowEnd : expectedEnd;
    }

    private void validateBookingDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDate today = now().toLocalDate();
        LocalDate maxDate = maxBookingDate();
        LocalDate bookingDate = startTime.toLocalDate();

        if (bookingDate.isBefore(today) || bookingDate.isAfter(maxDate)) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        if (startTime.isBefore(now())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }
    }

    private void validateBusinessHours(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDate bookingDate = startTime.toLocalDate();
        LocalDateTime open = businessStart(bookingDate);
        LocalDateTime close = businessEnd(bookingDate);

        if (startTime.isBefore(open) || !startTime.isBefore(close) || endTime.isAfter(close)) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }
    }

    private void validateSlotAlignment(LocalDateTime startTime) {
        if (startTime.getSecond() != 0
                || startTime.getNano() != 0
                || startTime.getMinute() % SLOT_INTERVAL_MINUTES != 0) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }
    }

    private void validateRequestedSlot(LocalDateTime startTime, LocalDateTime endTime) {
        validateSlotAlignment(startTime);
        validateBookingDateRange(startTime, endTime);
        validateBusinessHours(startTime, endTime);
    }

    private boolean hasOverlap(Table table, LocalDateTime start, LocalDateTime end) {
        return reservationRepository.existsByTableAndTimeOverlapAndStatusIn(
                table,
                start,
                end,
                BLOCKING_STATUSES
        );
    }

    private List<TimeSlotAvailabilityResponse> buildSlotAvailabilityForTable(Table table, int numberOfGuests, LocalDate bookingDate) {
        List<LocalDateTime> businessSlots = buildBusinessHourSlots(bookingDate);
        LocalDateTime now = now();
        LocalDateTime windowStart = bookingDate.equals(now.toLocalDate())
                ? roundUpToSlot(now)
                : businessStart(bookingDate);
        if (windowStart.isBefore(businessStart(bookingDate))) {
            windowStart = businessStart(bookingDate);
        }
        LocalDateTime windowEnd = businessEnd(bookingDate);
        int durationMinutes = defaultReservationDurationMinutes();
        final LocalDateTime effectiveWindowStart = windowStart;

        return businessSlots.stream()
                .map(slot -> {
                    LocalDateTime expectedEnd = slot.plusMinutes(durationMinutes);
                    LocalDateTime slotEnd = expectedEnd.isAfter(windowEnd) ? windowEnd : expectedEnd;
                    boolean withinWindow = !slot.isBefore(effectiveWindowStart) && slot.isBefore(windowEnd);
                    
                    boolean enoughCapacity = table.getCapacity() >= numberOfGuests;
                    boolean hasConflict = withinWindow
                            && enoughCapacity
                            && hasOverlap(table, slot, slotEnd);

                    boolean available = withinWindow && enoughCapacity && !hasConflict;

                    String reason;
                    if (!enoughCapacity) {
                        reason = "CAPACITY_EXCEEDED";
                    } else if (!withinWindow) {
                        reason = "OUTSIDE_BOOKING_WINDOW";
                    } else if (hasConflict) {
                        reason = "RESERVED";
                    } else {
                        reason = "AVAILABLE";
                    }

                    return TimeSlotAvailabilityResponse.builder()
                            .startTime(slot)
                            .endTime(slotEnd)
                            .timeSlot(slot)
                            .available(available)
                            .reason(reason)
                            .build();
                })
                .toList();
    }

    @Override
    public ReservationResponse create(ReservationRequest request) {
        LocalDateTime startTime = resolveStartTime(request);
        LocalDateTime endTime = resolveEndTime(startTime);
        validateRequestedSlot(startTime, endTime);

        // 1. Load table
        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.TABLE_NOT_FOUND,
                        "Table not found id: " + request.getTableId()
                ));

        // 2. Validate capacity
        if (request.getNumberOfGuests() > table.getCapacity()) {
            throw  new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_CAPACITY,
                    "Reservation invalid capacity: " + request.getNumberOfGuests() + " > " + table.getCapacity()
            );
        }

        // 3. Validate minimum guests
        if (request.getNumberOfGuests() < 1) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_CAPACITY,
                    "Number of guests must be at least 1"
            );
        }

        // 4. Check time conflict with pessimistic lock to prevent race condition
        boolean exists = reservationRepository
                .existsByTableAndTimeOverlapAndStatusInWithLock(
                        table,
                        startTime,
                        endTime,
                        BLOCKING_STATUSES
                );

        if (exists) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_TIME_CONFLICT,
                    "Selected time slot is not available"
            );
        }

        // 5. Map → entity
        Reservation reservation = reservationMapper.toEntity(request, table);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            userRepository.findByEmail(authentication.getName()).ifPresent(reservation::setUser);
        }

        // 6. Save
        Reservation saved = reservationRepository.save(reservation);

        try {
            var resDto = reservationMapper.toResponse(saved);
            messagingTemplate.convertAndSend("/topic/reservations", resDto);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message for reservation creation", e);
        }

        return reservationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getById(UUID id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.RESERVATION_NOT_FOUND,
                        "Reservation not found id: " + id
                ));

        return reservationMapper.toResponse(reservation);
    }

    @Override
    public PageResponse<ReservationResponse> getAll(Pageable pageable) {
        Page<Reservation> page = reservationRepository.findAll(pageable);

        Page<ReservationResponse> mapped = page.map(reservationMapper::toResponse);

        return new PageResponse<>(mapped);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllByStatus(List<ReservationStatus> statuses) {
        return reservationRepository.findByStatusIn(statuses)
                .stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getByCustomerName(String name, Pageable pageable) {

        Page<Reservation> page =
                reservationRepository.findByCustomerNameContainingIgnoreCase(name, pageable);

        return new PageResponse<>(page.map(reservationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getByPhone(String phone, Pageable pageable) {

        Page<Reservation> page =
                reservationRepository.findByPhoneContaining(phone, pageable);

        return new PageResponse<>(page.map(reservationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getMyReservations(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));
        
        Page<Reservation> page = reservationRepository.findByUserId(user.getId(), pageable);
        return new PageResponse<>(page.map(reservationMapper::toResponse));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAvailableTables(LocalDateTime reservationTime, int numberOfGuests) {
        LocalDateTime endTime = resolveEndTime(reservationTime);
        validateRequestedSlot(reservationTime, endTime);

        // Get all tables with sufficient capacity
        List<Table> allTables = tableRepository.findAll();

        // Filter by capacity and time conflicts
        return allTables.stream()
                .filter(table -> table.getCapacity() >= numberOfGuests)
                .filter(table -> !hasOverlap(table, reservationTime, endTime))
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableAvailabilityResponse> getTableAvailabilityByTimeSlots(LocalDate date, int numberOfGuests) {
        LocalDate bookingDate = date;
        if (bookingDate.isBefore(now().toLocalDate()) || bookingDate.isAfter(maxBookingDate())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        // Get all tables with sufficient capacity
        List<Table> allTables = tableRepository.findAll().stream()
                .filter(table -> table.getCapacity() >= numberOfGuests)
                .toList();

        // For each table, check availability for each time slot
        return allTables.stream()
                .map(table -> {
                    List<TimeSlotAvailabilityResponse> slotAvailability = buildSlotAvailabilityForTable(table, numberOfGuests, bookingDate);

                    return TableAvailabilityResponse.builder()
                            .table(tableMapper.toResponse(table))
                            .timeSlots(slotAvailability)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingWindowResponse getBookingWindowForTable(UUID tableId, int numberOfGuests, LocalDate date) {
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.TABLE_NOT_FOUND,
                        "Table not found id: " + tableId
                ));

        LocalDate bookingDate = date != null ? date : now().toLocalDate();
        if (bookingDate.isBefore(now().toLocalDate()) || bookingDate.isAfter(maxBookingDate())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        LocalDateTime referenceNow = now();
        List<TimeSlotAvailabilityResponse> availableSlots = buildSlotAvailabilityForTable(table, numberOfGuests, bookingDate);

        return BookingWindowResponse.builder()
                .bookingDate(bookingDate)
                .businessHoursStart(openingTime())
                .businessHoursEnd(closingTime())
                .bookingWindowStart(bookingDate.equals(referenceNow.toLocalDate())
                        ? roundUpToSlot(referenceNow)
                        : businessStart(bookingDate))
                .bookingWindowEnd(businessEnd(bookingDate))
                .defaultDurationMinutes(defaultReservationDurationMinutes())
                .availableSlots(availableSlots)
                .build();
    }

    @Override
    public ReservationResponse checkIn(UUID id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.RESERVATION_NOT_FOUND,
                        "Reservation not found id: " + id
                ));

        // Validate state
        if (reservation.getStatus() != RESERVED) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_STATUS,
                    "Only RESERVED reservations can be checked in"
            );
        }

        // Update reservation
        reservation.setStatus(CHECKED_IN);

        // Update table
        Table table = reservation.getTable();

        table.setStatus(TableStatus.OCCUPIED);

        tableRepository.save(table);

        orderService.createFromReservation(reservation);

        try {
            var tableDto = tableMapper.toResponse(table);
            messagingTemplate.convertAndSend("/topic/tables", tableDto);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message for table update", e);
        }

        Reservation saved = reservationRepository.save(reservation);

        try {
            var resDto = reservationMapper.toResponse(saved);
            messagingTemplate.convertAndSend("/topic/reservations", resDto);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message for reservation update", e);
        }

        return reservationMapper.toResponse(saved);
    }

    @Override
    public ReservationResponse updateStatus(UUID id, ReservationStatus status) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.RESERVATION_NOT_FOUND,
                        "Reservation not found id: " + id
                ));

        if (status == null) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Reservation status is required"
            );
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_ALREADY_CANCELLED,
                    "Reservation already cancelled"
            );
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_STATUS,
                    "Reservation already completed"
            );
        }

        if (status == ReservationStatus.CHECKED_IN) {
            return checkIn(id);
        }

        if (status == ReservationStatus.COMPLETED) {
            if (reservation.getStatus() != CHECKED_IN) {
                throw new BadRequestException(
                        ErrorCode.RESERVATION_INVALID_STATUS,
                        "Only CHECKED_IN reservations can be completed"
                );
            }

            List<Order> activeOrders = orderRepository.findActiveByReservationIdWithLock(
                    reservation.getId(),
                    List.of(OrderStatus.OPEN, OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.READY, OrderStatus.SERVED)
            );

            boolean hasBillableOrder = activeOrders.stream()
                    .anyMatch(order -> order.getItems() != null
                            && !order.getItems().isEmpty()
                            && order.getTotalAmount() != null
                            && order.getTotalAmount().compareTo(BigDecimal.ZERO) > 0);

            if (hasBillableOrder) {
                throw new BadRequestException(
                        ErrorCode.INVALID_INPUT,
                        "Complete payment before closing a reservation with items"
                );
            }

            for (Order order : activeOrders) {
                order.setStatus(CANCELED);
                orderRepository.save(order);
            }

            reservation.setStatus(ReservationStatus.COMPLETED);

            Table table = reservation.getTable();
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);

                try {
                    var tableDto = tableMapper.toResponse(table);
                    messagingTemplate.convertAndSend("/topic/tables", tableDto);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message for table update", e);
                }
            }

            Reservation saved = reservationRepository.save(reservation);

            try {
                var resDto = reservationMapper.toResponse(saved);
                messagingTemplate.convertAndSend("/topic/reservations", resDto);
            } catch (Exception e) {
                log.error("Failed to send WebSocket message for reservation update", e);
            }

            return reservationMapper.toResponse(saved);
        }

        if (status == ReservationStatus.CANCELLED) {
            if (reservation.getStatus() == CHECKED_IN) {
                throw new BadRequestException(
                        ErrorCode.RESERVATION_INVALID_STATUS,
                        "Cannot cancel after check-in"
                );
            }

            reservation.setStatus(ReservationStatus.CANCELLED);
            Table table = reservation.getTable();
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);

                try {
                    var tableDto = tableMapper.toResponse(table);
                    messagingTemplate.convertAndSend("/topic/tables", tableDto);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message for table update", e);
                }
            }

            Reservation saved = reservationRepository.save(reservation);

            try {
                var resDto = reservationMapper.toResponse(saved);
                messagingTemplate.convertAndSend("/topic/reservations", resDto);
            } catch (Exception e) {
                log.error("Failed to send WebSocket message for reservation update", e);
            }

            return reservationMapper.toResponse(saved);
        }

        if (status == ReservationStatus.NO_SHOW) {
            if (reservation.getStatus() != RESERVED) {
                throw new BadRequestException(
                        ErrorCode.RESERVATION_INVALID_STATUS,
                        "Only RESERVED reservations can be marked as no-show"
                );
            }

            reservation.setStatus(ReservationStatus.NO_SHOW);
            Table table = reservation.getTable();
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);

                try {
                    var tableDto = tableMapper.toResponse(table);
                    messagingTemplate.convertAndSend("/topic/tables", tableDto);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message for table update", e);
                }
            }

            Reservation saved = reservationRepository.save(reservation);

            try {
                var resDto = reservationMapper.toResponse(saved);
                messagingTemplate.convertAndSend("/topic/reservations", resDto);
            } catch (Exception e) {
                log.error("Failed to send WebSocket message for reservation update", e);
            }

            return reservationMapper.toResponse(saved);
        }

        throw new BadRequestException(
                ErrorCode.INVALID_INPUT,
                "Unsupported reservation status transition: " + status
        );
    }

    @Override
    public ReservationResponse cancel(UUID id) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.RESERVATION_NOT_FOUND,
                        "Reservation not found id: " + id
                ));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_ALREADY_CANCELLED,
                    "Reservation already cancelled"
            );
        }

        // Optional: không cho cancel nếu đã check-in
        if (reservation.getStatus() == CHECKED_IN) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_STATUS,
                    "Cannot cancel after check-in"
            );
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Table table = reservation.getTable();
        if (table != null) {
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);

            try {
                var tableDto = tableMapper.toResponse(table);
                messagingTemplate.convertAndSend("/topic/tables", tableDto);
            } catch (Exception e) {
                log.error("Failed to send WebSocket message for table update", e);
            }
        }

        Reservation saved = reservationRepository.save(reservation);

        try {
            var resDto = reservationMapper.toResponse(saved);
            messagingTemplate.convertAndSend("/topic/reservations", resDto);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message for reservation update", e);
        }

        return reservationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getBookedSlotsForTable(UUID tableId, java.time.LocalDate date) {
        if (date.isBefore(now().toLocalDate()) || date.isAfter(maxBookingDate())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Selected time slot is not available"
            );
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<Reservation> reservations = reservationRepository.findByTableIdAndStartTimeBetween(tableId, startOfDay, endOfDay);
        
        return reservations.stream()
                .filter(r -> BLOCKING_STATUSES.contains(r.getStatus()))
                .map(r -> {
                    java.time.LocalTime time = r.getStartTime().toLocalTime();
                    return String.format("%02d:%02d", time.getHour(), time.getMinute());
                })
                .toList();
    }
}
