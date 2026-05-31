package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.order.service.OrderService;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.dto.BookingWindowResponse;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.reservation.mapper.ReservationMapper;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.settings.dto.SettingsDTO;
import com.restaurant.platform.modules.settings.service.SettingsService;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;
import com.restaurant.platform.modules.table.mapper.TableMapper;
import com.restaurant.platform.modules.table.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceImplTest {

    private static final ZoneId TEST_ZONE = ZoneId.of("Asia/Bangkok");
    private static final Instant FIXED_INSTANT = Instant.parse("2026-05-31T08:20:00Z");
    private static final LocalDate FIXED_DATE = LocalDate.of(2026, 5, 31);

    @Mock private ReservationRepository reservationRepository;
    @Mock private TableRepository tableRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private ReservationMapper reservationMapper;
    @Mock private OrderService orderService;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private TableMapper tableMapper;
    @Mock private UserRepository userRepository;
    @Mock private SettingsService settingsService;
    @Mock private Clock clock;

    @InjectMocks private ReservationServiceImpl reservationService;

    @BeforeEach
    void setUp() {
        lenient().when(clock.instant()).thenReturn(FIXED_INSTANT);
        lenient().when(clock.getZone()).thenReturn(TEST_ZONE);
        lenient().when(settingsService.getSettings()).thenReturn(SettingsDTO.builder()
                .openingTime("10:00")
                .closingTime("22:00")
                .defaultReservationDuration(120)
                .build());
    }

    @Test
    void createShouldPersistReservationIntervalWithoutForcingTableStatus() {
        UUID tableId = UUID.randomUUID();
        UUID reservationId = UUID.randomUUID();

        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(FIXED_DATE.atTime(15, 30))
                .endTime(FIXED_DATE.atTime(17, 30))
                .numberOfGuests(2)
                .status(ReservationStatus.RESERVED)
                .build();
        reservation.setDeleted(false);

        ReservationRequest request = new ReservationRequest();
        request.setTableId(tableId);
        request.setCustomerName("Customer");
        request.setPhone("0900000000");
        request.setStartTime(FIXED_DATE.atTime(15, 30));
        request.setNumberOfGuests(2);

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(table));
        when(reservationRepository.existsByTableAndTimeOverlapAndStatusInWithLock(eq(table), any(), any(), any()))
                .thenReturn(false);
        when(reservationMapper.toEntity(request, table)).thenReturn(reservation);
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationMapper.toResponse(any(Reservation.class))).thenAnswer(invocation -> reservationResponse(invocation.getArgument(0)));

        ReservationResponse response = reservationService.create(request);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.RESERVED);
        assertThat(response.getStartTime()).isEqualTo(FIXED_DATE.atTime(15, 30));
        assertThat(response.getEndTime()).isEqualTo(FIXED_DATE.atTime(17, 30));
        assertThat(table.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        verify(tableRepository, never()).save(table);
        verify(reservationRepository).save(reservation);
    }

    @Test
    void createShouldRejectFutureDayReservation() {
        ReservationRequest request = new ReservationRequest();
        request.setTableId(UUID.randomUUID());
        request.setCustomerName("Customer");
        request.setPhone("0900000000");
        request.setStartTime(FIXED_DATE.plusDays(5).atTime(16, 0));
        request.setNumberOfGuests(2);

        assertThatThrownBy(() -> reservationService.create(request))
                .isInstanceOf(com.restaurant.platform.common.exception.BadRequestException.class)
                .hasMessageContaining("Selected time slot is not available");
    }

    @Test
    void getTableAvailabilityByTimeSlotsShouldOnlyReturnRemainingTodaySlots() {
        UUID tableId = UUID.randomUUID();
        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        when(tableRepository.findAll()).thenReturn(java.util.List.of(table));
        when(reservationRepository.existsByTableAndTimeOverlapAndStatusIn(eq(table), any(), any(), any()))
                .thenReturn(false);
        when(tableMapper.toResponse(table)).thenReturn(TableResponse.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build());

        var response = reservationService.getTableAvailabilityByTimeSlots(FIXED_DATE, 2);

        assertThat(response).hasSize(1);
        assertThat(response.get(0).getTimeSlots()).hasSize(25);
        assertThat(response.get(0).getTimeSlots().get(0).getStartTime().toLocalTime().toString()).isEqualTo("10:00");
        assertThat(response.get(0).getTimeSlots().get(0).isAvailable()).isFalse();
        assertThat(response.get(0).getTimeSlots().get(0).getReason()).isEqualTo("OUTSIDE_BOOKING_WINDOW");
        assertThat(response.get(0).getTimeSlots())
                .anySatisfy(slot -> {
                    if ("15:30".equals(slot.getStartTime().toLocalTime().toString())) {
                        assertThat(slot.isAvailable()).isTrue();
                        assertThat(slot.getReason()).isEqualTo("AVAILABLE");
                    }
                });
        assertThat(response.get(0).getTimeSlots().get(response.get(0).getTimeSlots().size() - 1).getStartTime().toLocalTime().toString()).isEqualTo("22:00");
        assertThat(response.get(0).getTimeSlots().get(response.get(0).getTimeSlots().size() - 1).isAvailable()).isFalse();
        assertThat(response.get(0).getTimeSlots().get(response.get(0).getTimeSlots().size() - 1).getReason()).isEqualTo("OUTSIDE_BOOKING_WINDOW");
    }

    @Test
    void getBookingWindowForTableShouldExposeWindowAndAllBusinessSlots() {
        UUID tableId = UUID.randomUUID();
        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(table));
        when(reservationRepository.existsByTableAndTimeOverlapAndStatusIn(eq(table), any(), any(), any()))
                .thenReturn(false);

        BookingWindowResponse response = reservationService.getBookingWindowForTable(tableId, 2, FIXED_DATE);

        assertThat(response.getBookingDate()).isEqualTo(FIXED_DATE);
        assertThat(response.getBusinessHoursStart().toString()).isEqualTo("10:00");
        assertThat(response.getBusinessHoursEnd().toString()).isEqualTo("22:00");
        assertThat(response.getBookingWindowStart().toLocalTime().toString()).isEqualTo("15:30");
        assertThat(response.getBookingWindowEnd().toLocalTime().toString()).isEqualTo("22:00");
        assertThat(response.getDefaultDurationMinutes()).isEqualTo(120);
        assertThat(response.getAvailableSlots()).hasSize(25);
        assertThat(response.getAvailableSlots())
                .anySatisfy(slot -> {
                    if ("15:30".equals(slot.getStartTime().toLocalTime().toString())) {
                        assertThat(slot.isAvailable()).isTrue();
                        assertThat(slot.getReason()).isEqualTo("AVAILABLE");
                    }
                });
    }

    @Test
    void checkInShouldMarkTableOccupiedAndCreateActiveOrderImmediately() {
        UUID reservationId = UUID.randomUUID();
        UUID tableId = UUID.randomUUID();

        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(FIXED_DATE.atTime(16, 0))
                .endTime(FIXED_DATE.atTime(18, 0))
                .numberOfGuests(2)
                .status(ReservationStatus.RESERVED)
                .build();
        reservation.setDeleted(false);

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(tableRepository.save(table)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableMapper.toResponse(table)).thenReturn(TableResponse.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .type(TableType.NORMAL)
                .build());
        when(reservationMapper.toResponse(any(Reservation.class))).thenReturn(ReservationResponse.builder()
                .id(reservationId)
                .tableId(tableId)
                .tableName("T1")
                .tableCapacity(4)
                .status(ReservationStatus.CHECKED_IN)
                .build());

        ReservationResponse response = reservationService.checkIn(reservationId);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.CHECKED_IN);
        assertThat(table.getStatus()).isEqualTo(TableStatus.OCCUPIED);
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CHECKED_IN);
        verify(orderService).createFromReservation(reservation);
        verify(tableRepository).save(table);
        verify(reservationRepository).save(reservation);
    }

    @Test
    void completeShouldMarkReservationCompletedAndFreeTable() {
        UUID reservationId = UUID.randomUUID();
        UUID tableId = UUID.randomUUID();

        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(FIXED_DATE.atTime(16, 0))
                .endTime(FIXED_DATE.atTime(18, 0))
                .numberOfGuests(2)
                .status(ReservationStatus.CHECKED_IN)
                .build();
        reservation.setDeleted(false);

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(tableRepository.save(table)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableMapper.toResponse(table)).thenReturn(TableResponse.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build());
        when(reservationMapper.toResponse(any(Reservation.class))).thenReturn(ReservationResponse.builder()
                .id(reservationId)
                .tableId(tableId)
                .tableName("T1")
                .tableCapacity(4)
                .status(ReservationStatus.COMPLETED)
                .build());

        ReservationResponse response = reservationService.updateStatus(reservationId, ReservationStatus.COMPLETED);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        assertThat(table.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        verify(tableRepository).save(table);
        verify(reservationRepository).save(reservation);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void completeShouldCancelEmptyActiveOrderAndFreeTable() {
        UUID reservationId = UUID.randomUUID();
        UUID tableId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();

        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(FIXED_DATE.atTime(16, 0))
                .endTime(FIXED_DATE.atTime(18, 0))
                .numberOfGuests(2)
                .status(ReservationStatus.CHECKED_IN)
                .build();
        reservation.setDeleted(false);

        Order emptyOrder = Order.builder()
                .id(orderId)
                .table(table)
                .reservation(reservation)
                .status(OrderStatus.COOKING)
                .totalAmount(java.math.BigDecimal.ZERO)
                .build();
        emptyOrder.setDeleted(false);

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(orderRepository.findActiveByReservationIdWithLock(eq(reservationId), any())).thenReturn(java.util.List.of(emptyOrder));
        when(orderRepository.save(emptyOrder)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableRepository.save(table)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableMapper.toResponse(table)).thenReturn(TableResponse.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build());
        when(reservationMapper.toResponse(any(Reservation.class))).thenReturn(ReservationResponse.builder()
                .id(reservationId)
                .tableId(tableId)
                .tableName("T1")
                .tableCapacity(4)
                .status(ReservationStatus.COMPLETED)
                .build());

        ReservationResponse response = reservationService.updateStatus(reservationId, ReservationStatus.COMPLETED);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        assertThat(table.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        assertThat(emptyOrder.getStatus()).isEqualTo(OrderStatus.CANCELED);
        verify(orderRepository).save(emptyOrder);
        verify(tableRepository).save(table);
        verify(reservationRepository).save(reservation);
    }

    @Test
    void cancelShouldReleaseReservedTable() {
        UUID reservationId = UUID.randomUUID();
        UUID tableId = UUID.randomUUID();

        Table table = Table.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.RESERVED)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);

        Reservation reservation = Reservation.builder()
                .id(reservationId)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(FIXED_DATE.atTime(16, 0))
                .endTime(FIXED_DATE.atTime(18, 0))
                .numberOfGuests(2)
                .status(ReservationStatus.RESERVED)
                .build();
        reservation.setDeleted(false);

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(tableRepository.save(table)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableMapper.toResponse(table)).thenReturn(TableResponse.builder()
                .id(tableId)
                .name("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .type(TableType.NORMAL)
                .build());
        when(reservationMapper.toResponse(any(Reservation.class))).thenAnswer(invocation -> reservationResponse(invocation.getArgument(0)));

        ReservationResponse response = reservationService.cancel(reservationId);

        assertThat(response.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        assertThat(table.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        verify(tableRepository).save(table);
        verify(reservationRepository).save(reservation);
    }

    private ReservationResponse reservationResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .reservationTime(reservation.getStartTime())
                .tableId(reservation.getTable() != null ? reservation.getTable().getId() : null)
                .tableName(reservation.getTable() != null ? reservation.getTable().getName() : null)
                .tableCapacity(reservation.getTable() != null ? reservation.getTable().getCapacity() : null)
                .status(reservation.getStatus())
                .build();
    }
}
