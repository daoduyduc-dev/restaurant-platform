package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.service.OrderService;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.restaurant.platform.modules.table.mapper.TableMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.restaurant.platform.modules.reservation.enums.ReservationStatus.*;

@Service
@Transactional
@RequiredArgsConstructor
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

        // 2. Validate table status
        if (table.getStatus() != TableStatus.AVAILABLE) {
            throw  new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_STATUS,
                    "Reservation invalid status: " + table.getStatus()
            );
        }

        // 3. Validate capacity
        if (request.getNumberOfGuests() > table.getCapacity()) {
            throw  new BadRequestException(
                    ErrorCode.RESERVATION_INVALID_CAPACITY,
                    "Reservation invalid capacity: " + request.getNumberOfGuests() + " > " + table.getCapacity()
            );
        }

        // 4. Check time conflict
        LocalDateTime start = request.getReservationTime().minusHours(2);
        LocalDateTime end = request.getReservationTime().plusHours(2);

        boolean exists = reservationRepository
                .existsByTableAndReservationTimeBetweenAndStatusIn(
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

        // 5. Map → entity
        Reservation reservation = reservationMapper.toEntity(request, table);

        // 6. Save
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
        // Get all available tables with sufficient capacity
        List<Table> allAvailableTables = tableRepository.findByStatusIn(List.of(TableStatus.AVAILABLE));
        
        // Filter by capacity and check time conflicts
        return allAvailableTables.stream()
                .filter(table -> table.getCapacity() >= numberOfGuests)
                .filter(table -> {
                    // Check for time conflicts
                    LocalDateTime start = reservationTime.minusHours(2);
                    LocalDateTime end = reservationTime.plusHours(2);
                    
                    return !reservationRepository.existsByTableAndReservationTimeBetweenAndStatusIn(
                            table, start, end, ACTIVE_STATUSES);
                })
                .map(tableMapper::toResponse)
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
        } catch (Exception ignored) {
        }

        Reservation saved = reservationRepository.save(reservation);

        try {
            var resDto = reservationMapper.toResponse(saved);
            messagingTemplate.convertAndSend("/topic/reservations", resDto);
        } catch (Exception ignored) {}

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
