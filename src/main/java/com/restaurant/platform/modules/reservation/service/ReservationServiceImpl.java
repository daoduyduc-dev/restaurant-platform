package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.service.OrderService;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.dto.TableAvailabilityResponse;
import com.restaurant.platform.modules.reservation.dto.TimeSlotAvailabilityResponse;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.reservation.mapper.ReservationMapper;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.reservation.service.ReservationService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.restaurant.platform.modules.reservation.enums.ReservationStatus.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final ReservationMapper reservationMapper;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TableMapper tableMapper;
    private final UserRepository userRepository;

    List<ReservationStatus> ACTIVE_STATUSES = List.of(
            RESERVED,
            CHECKED_IN
    );

    @Override
    public ReservationResponse create(ReservationRequest request) {

        // 1. Load table
        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.TABLE_NOT_FOUND,
                        "Table not found id: " + request.getTableId()
                ));

        // 2. Tables are always bookable - no status check needed
        // Status validation is done by time slot availability in frontend

        // 3. Validate capacity
        if (request.getNumberOfGuests() > table.getCapacity()) {
            throw  new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_CAPACITY,
                    "Reservation invalid capacity: " + request.getNumberOfGuests() + " > " + table.getCapacity()
            );
        }

        // 4. Validate reservation time is in the future
        if (request.getReservationTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_TIME,
                    "Reservation time must be in the future"
            );
        }

        // 5. Validate minimum guests
        if (request.getNumberOfGuests() < 1) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_CAPACITY,
                    "Number of guests must be at least 1"
            );
        }

        // 6. Check time conflict with pessimistic lock to prevent race condition
        LocalDateTime start = request.getReservationTime().minusHours(2);
        LocalDateTime end = request.getReservationTime().plusHours(2);

        boolean exists = reservationRepository
                .existsByTableAndReservationTimeBetweenAndStatusInWithLock(
                        table,
                        start,
                        end,
                        ACTIVE_STATUSES
                );

        if (exists) {
            throw new BadRequestException(
                    ErrorCode.RESERVATION_TIME_CONFLICT,
                    "Table already reserved in this time slot"
            );
        }

        // 7. Map → entity
        Reservation reservation = reservationMapper.toEntity(request, table);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            userRepository.findByEmail(authentication.getName()).ifPresent(reservation::setUser);
        }

        // 8. Save
        return reservationMapper.toResponse(reservationRepository.save(reservation));
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
        // Get all tables with sufficient capacity (tables are always bookable)
        List<Table> allTables = tableRepository.findAll();

        // Filter by capacity and check time conflicts
        return allTables.stream()
                .filter(table -> table.getCapacity() >= numberOfGuests)
                .filter(table -> {
                    // Check for time conflicts (4-hour window: ±2 hours)
                    LocalDateTime start = reservationTime.minusHours(2);
                    LocalDateTime end = reservationTime.plusHours(2);

                    return !reservationRepository.existsByTableAndReservationTimeBetweenAndStatusIn(
                            table, start, end, ACTIVE_STATUSES);
                })
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableAvailabilityResponse> getTableAvailabilityByTimeSlots(LocalDateTime date, int numberOfGuests) {
        // Get all tables with sufficient capacity
        List<Table> allTables = tableRepository.findAll().stream()
                .filter(table -> table.getCapacity() >= numberOfGuests)
                .toList();

        // Generate time slots for the day (e.g., 10:00 AM to 10:00 PM, every hour)
        List<LocalDateTime> timeSlots = new java.util.ArrayList<>();
        LocalDateTime startTime = date.withHour(10).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endTime = date.withHour(22).withMinute(0).withSecond(0).withNano(0);

        LocalDateTime current = startTime;
        while (!current.isAfter(endTime)) {
            timeSlots.add(current);
            current = current.plusHours(1);
        }

        // For each table, check availability for each time slot
        return allTables.stream()
                .map(table -> {
                    List<TimeSlotAvailabilityResponse> slotAvailability = timeSlots.stream()
                            .map(slot -> {
                                // Check for time conflicts (4-hour window: ±2 hours)
                                LocalDateTime start = slot.minusHours(2);
                                LocalDateTime end = slot.plusHours(2);

                                boolean hasConflict = reservationRepository.existsByTableAndReservationTimeBetweenAndStatusIn(
                                        table, start, end, ACTIVE_STATUSES);

                                String reason;
                                if (!hasConflict) {
                                    reason = "AVAILABLE";
                                } else {
                                    // Check if table is currently occupied or reserved
                                    if (table.getStatus() == TableStatus.OCCUPIED) {
                                        reason = "OCCUPIED";
                                    } else if (table.getStatus() == TableStatus.RESERVED) {
                                        reason = "RESERVED";
                                    } else {
                                        reason = "RESERVED"; // Has reservation conflict
                                    }
                                }

                                return TimeSlotAvailabilityResponse.builder()
                                        .timeSlot(slot)
                                        .available(!hasConflict)
                                        .reason(reason)
                                        .build();
                            })
                            .toList();

                    return TableAvailabilityResponse.builder()
                            .table(tableMapper.toResponse(table))
                            .timeSlots(slotAvailability)
                            .build();
                })
                .toList();
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

        return reservationMapper.toResponse(reservationRepository.save(reservation));
    }

}
