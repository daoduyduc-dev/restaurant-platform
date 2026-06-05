package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.modules.menu.entity.MenuItem;
import com.restaurant.platform.modules.menu.repository.MenuItemRepository;
import com.restaurant.platform.modules.order.dto.request.AddOrderItemRequest;
import com.restaurant.platform.modules.order.dto.request.CreateOrderRequest;
import com.restaurant.platform.modules.order.dto.response.OrderItemResponse;
import com.restaurant.platform.modules.order.dto.response.OrderResponse;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.order.entity.OrderItem;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.order.mapper.OrderItemMapper;
import com.restaurant.platform.modules.order.mapper.OrderMapper;
import com.restaurant.platform.modules.order.repository.OrderItemRepository;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;
import com.restaurant.platform.modules.table.repository.TableRepository;
import com.restaurant.platform.modules.loyalty.service.LoyaltyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private TableRepository tableRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private UserRepository userRepository;
    @Mock private LoyaltyService loyaltyService;
    @Mock private OrderBillingService orderBillingService;
    @Mock private OrderMapper orderMapper;
    @Mock private OrderItemMapper orderItemMapper;

    @InjectMocks private OrderServiceImpl orderService;

    @Test
    void createShouldReuseExistingActiveOrderForCheckedInReservation() {
        UUID tableId = UUID.randomUUID();
        UUID reservationId = UUID.randomUUID();
        UUID menuItemId = UUID.randomUUID();

        Table table = table(tableId, "T1");
        Reservation reservation = reservation(reservationId, table, ReservationStatus.CHECKED_IN);
        Order existingOrder = order(UUID.randomUUID(), table, null, OrderStatus.COOKING, LocalDateTime.now().minusMinutes(5));
        MenuItem menuItem = menuItem(menuItemId, "Burger", BigDecimal.valueOf(120_000));

        AddOrderItemRequest itemRequest = new AddOrderItemRequest();
        itemRequest.setMenuItemId(menuItemId);
        itemRequest.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setTableId(tableId);
        request.setReservationId(reservationId);
        request.setItems(List.of(itemRequest));

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(table));
        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(orderRepository.findActiveByTableWithLock(eq(table), any())).thenReturn(List.of(existingOrder));
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(existingOrder)).thenAnswer(invocation -> invocation.getArgument(0));
        mockMapping();

        OrderResponse response = orderService.create(request);

        assertThat(response.getId()).isEqualTo(existingOrder.getId());
        assertThat(response.getReservationId()).isEqualTo(reservationId);
        assertThat(response.getItems()).hasSize(1);
        assertThat(existingOrder.getReservation()).isEqualTo(reservation);
        assertThat(existingOrder.getItems()).hasSize(1);
        verify(orderRepository).save(existingOrder);
    }

    @Test
    void getActiveOrdersShouldReturnOneOrderPerTable() {
        Table tableA = table(UUID.randomUUID(), "T1");
        Table tableB = table(UUID.randomUUID(), "T2");

        Order tableAEmpty = order(UUID.randomUUID(), tableA, null, OrderStatus.COOKING, LocalDateTime.now().minusMinutes(15));
        Order tableAFilled = order(UUID.randomUUID(), tableA, null, OrderStatus.COOKING, LocalDateTime.now().minusMinutes(10));
        tableAFilled.addItem(orderItem(UUID.randomUUID(), tableAFilled, menuItem(UUID.randomUUID(), "Soup", BigDecimal.valueOf(50_000)), 2));
        Order tableBOrder = order(UUID.randomUUID(), tableB, null, OrderStatus.READY, LocalDateTime.now().minusMinutes(7));

        when(orderRepository.findByStatusIn(any())).thenReturn(List.of(tableAEmpty, tableAFilled, tableBOrder));
        when(orderMapper.toResponse(any(Order.class))).thenAnswer(invocation -> orderResponse(invocation.getArgument(0)));
        when(orderItemMapper.toResponse(any(OrderItem.class))).thenAnswer(invocation -> orderItemResponse(invocation.getArgument(0)));
        when(orderBillingService.getVipSurcharge(any())).thenReturn(BigDecimal.ZERO);
        when(orderBillingService.getFinalAmount(any())).thenAnswer(invocation -> ((Order) invocation.getArgument(0)).getTotalAmount());

        List<OrderResponse> result = orderService.getActiveOrders();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(OrderResponse::getTableId).containsExactlyInAnyOrder(tableA.getId(), tableB.getId());
        OrderResponse tableAResponse = result.stream()
                .filter(order -> tableA.getId().equals(order.getTableId()))
                .findFirst()
                .orElseThrow();
        assertThat(tableAResponse.getItems()).hasSize(1);
    }

    @Test
    void payShouldCompleteReservationAndFreeTable() {
        UUID tableId = UUID.randomUUID();
        UUID reservationId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID menuItemId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Table table = table(tableId, "T3");
        Order order = order(orderId, table, null, OrderStatus.READY, LocalDateTime.now().minusMinutes(8));
        Reservation reservation = reservation(reservationId, table, ReservationStatus.CHECKED_IN);
        User user = User.builder()
                .id(userId)
                .name("Customer")
                .email("customer@example.com")
                .password("secret")
                .active(true)
                .build();
        reservation.setUser(user);
        order.setReservation(reservation);
        order.addItem(orderItem(UUID.randomUUID(), order, menuItem(menuItemId, "Rice", BigDecimal.valueOf(40_000)), 1));
        order.setTotalAmount(BigDecimal.valueOf(40_000));

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenAnswer(invocation -> invocation.getArgument(0));
        when(tableRepository.save(table)).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenAnswer(invocation -> invocation.getArgument(0));
        mockMapping();

        OrderResponse response = orderService.pay(orderId);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.PAID.name());
        assertThat(table.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        verify(loyaltyService).earnPoints(eq(userId), eq(BigDecimal.valueOf(40_000)));
    }

    private void mockMapping() {
        when(orderMapper.toResponse(any(Order.class))).thenAnswer(invocation -> orderResponse(invocation.getArgument(0)));
        when(orderItemMapper.toResponse(any(OrderItem.class))).thenAnswer(invocation -> orderItemResponse(invocation.getArgument(0)));
        when(orderBillingService.getVipSurcharge(any())).thenReturn(BigDecimal.ZERO);
        when(orderBillingService.getFinalAmount(any())).thenAnswer(invocation -> ((Order) invocation.getArgument(0)).getTotalAmount());
    }

    private Table table(UUID id, String name) {
        Table table = Table.builder()
                .id(id)
                .name(name)
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .type(TableType.NORMAL)
                .build();
        table.setDeleted(false);
        return table;
    }

    private Reservation reservation(UUID id, Table table, ReservationStatus status) {
        Reservation reservation = Reservation.builder()
                .id(id)
                .table(table)
                .customerName("Customer")
                .phone("0900000000")
                .startTime(LocalDateTime.now().plusHours(1))
                .numberOfGuests(2)
                .status(status)
                .build();
        reservation.setDeleted(false);
        return reservation;
    }

    private Order order(UUID id, Table table, Reservation reservation, OrderStatus status, LocalDateTime createdAt) {
        Order order = Order.builder()
                .id(id)
                .table(table)
                .reservation(reservation)
                .status(status)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();
        order.setCreatedDate(createdAt);
        order.setModifiedDate(createdAt);
        order.setDeleted(false);
        return order;
    }

    private MenuItem menuItem(UUID id, String name, BigDecimal price) {
        MenuItem menuItem = MenuItem.builder()
                .id(id)
                .name(name)
                .price(price)
                .available(true)
                .build();
        menuItem.setDeleted(false);
        return menuItem;
    }

    private OrderItem orderItem(UUID id, Order order, MenuItem menuItem, int quantity) {
        OrderItem item = OrderItem.builder()
                .id(id)
                .order(order)
                .menuItem(menuItem)
                .quantity(quantity)
                .price(menuItem.getPrice())
                .build();
        item.setDeleted(false);
        return item;
    }

    private OrderResponse orderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTableId(order.getTable() != null ? order.getTable().getId() : null);
        response.setTableName(order.getTable() != null ? order.getTable().getName() : null);
        response.setReservationId(order.getReservation() != null ? order.getReservation().getId() : null);
        response.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedDate());
        return response;
    }

    private OrderItemResponse orderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null);
        response.setMenuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null);
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setTotal(item.getTotal());
        return response;
    }
}
