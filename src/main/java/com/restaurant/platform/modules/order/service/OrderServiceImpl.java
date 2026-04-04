package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
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
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.restaurant.platform.modules.auth.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    // ================= CREATE ORDER =================
    @Override
    public OrderResponse create(CreateOrderRequest request) {

        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.TABLE_NOT_FOUND, "Table not found"));

        // 🔥 check bàn đã có order OPEN chưa
        if (orderRepository.existsByTableAndStatus(table, OrderStatus.OPEN)) {
            throw new BadRequestException(
                    ErrorCode.ORDER_ALREADY_EXISTS,
                    "Table already has active order");
        }

        Reservation reservation = null;
        if (request.getReservationId() != null) {
            reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            ErrorCode.RESERVATION_NOT_FOUND, "Reservation not found"));
        }

        Order order = Order.builder()
                .table(table)
                .reservation(reservation)
                .status(OrderStatus.OPEN)
                .totalAmount(BigDecimal.ZERO)
                .build();

        table.setStatus(TableStatus.OCCUPIED);

        // Persist table status explicitly to avoid race conditions
        tableRepository.save(table);

        // Persist order
        order = orderRepository.save(order);

        // Notify kitchen staff of new order (lightweight notification)
        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_CREATED",
                    "orderId", order.getId().toString(),
                    "tableId", table.getId().toString(),
                    "message", "New order created",
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/KITCHEN", payload);
        } catch (Exception ignored) {
        }

        // Publish updated table status to table topic
        try {
            var tableDto = java.util.Map.of(
                    "id", table.getId().toString(),
                    "name", table.getName(),
                    "capacity", table.getCapacity(),
                    "status", table.getStatus().name()
            );
            messagingTemplate.convertAndSend("/topic/tables", tableDto);
        } catch (Exception ignored) {}

        return mapToResponse(order);
    }

    // ================= GET =================
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(UUID id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ORDER_NOT_FOUND, "Order not found"));

        return mapToResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> getAll(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return new PageResponse<>(page.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllByStatus(List<OrderStatus> statuses) {
        return orderRepository.findByStatusIn(statuses).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ================= ADD ITEM =================
    @Override
    public OrderResponse addItem(UUID orderId, AddOrderItemRequest request) {

        Order order = getOrderOrThrow(orderId);

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.MENU_ITEM_NOT_FOUND, "Menu item not found"));

        if (!menuItem.getAvailable()) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Menu item is not available");
        }

        // 🔥 merge item nếu đã tồn tại
        OrderItem existing = order.getItems().stream()
                .filter(i -> i.getMenuItem().getId().equals(menuItem.getId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
        } else {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .price(menuItem.getPrice())
                    .build();

            order.addItem(item);
        }

        recalculate(order);

        // Notify kitchen that order has been updated
        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_UPDATED",
                    "orderId", order.getId().toString(),
                    "message", "Order items updated",
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/KITCHEN", payload);
        } catch (Exception ignored) {
        }

        return mapToResponse(order);
    }

    // ================= UPDATE ITEM =================
    @Override
    public OrderResponse updateItem(UUID orderId, UUID orderItemId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Quantity must be greater than 0");
        }

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ORDER_ITEM_NOT_FOUND, "Order item not found"));

        item.setQuantity(quantity);

        recalculate(item.getOrder());

        // Notify kitchen of item quantity change
        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_ITEM_UPDATED",
                    "orderId", item.getOrder().getId().toString(),
                    "itemId", orderItemId.toString(),
                    "quantity", quantity.toString(),
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/KITCHEN", payload);
        } catch (Exception ignored) {
        }

        return mapToResponse(item.getOrder());
    }

    // ================= REMOVE ITEM =================
    @Override
    public void removeItem(UUID orderId, UUID orderItemId) {

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ORDER_ITEM_NOT_FOUND, "Order item not found"));

        Order order = item.getOrder();

        order.getItems().remove(item);

        recalculate(order);

        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_ITEM_REMOVED",
                    "orderId", order.getId().toString(),
                    "itemId", orderItemId.toString(),
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/KITCHEN", payload);
        } catch (Exception ignored) {
        }
    }

    // ================= PAY =================
    @Override
    public OrderResponse pay(UUID orderId) {

        Order order = getOrderOrThrow(orderId);

        if (order.getItems().isEmpty()) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Cannot pay order without items");
        }

        order.setStatus(OrderStatus.PAID);

        Table table = order.getTable();
        table.setStatus(TableStatus.AVAILABLE);
        // Persist table status explicitly
        tableRepository.save(table);

        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_PAID",
                    "orderId", order.getId().toString(),
                    "message", "Order has been paid",
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/RECEPTIONIST", payload);
            messagingTemplate.convertAndSend("/topic/notifications/role/WAITER", payload);
        } catch (Exception ignored) {
        }

        // publish table update
        try {
            var tableDto = java.util.Map.of(
                    "id", table.getId().toString(),
                    "name", table.getName(),
                    "capacity", table.getCapacity(),
                    "status", table.getStatus().name()
            );
            messagingTemplate.convertAndSend("/topic/tables", tableDto);
        } catch (Exception ignored) {}

        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse updateStatus(UUID orderId, OrderStatus status) {
        Order order = getOrderOrThrow(orderId);
        order.setStatus(status);
            if (status == OrderStatus.PAID) {
                Table table = order.getTable();
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
                try {
                    var tableDto = java.util.Map.of(
                            "id", table.getId().toString(),
                            "name", table.getName(),
                            "capacity", table.getCapacity(),
                            "status", table.getStatus().name()
                    );
                    messagingTemplate.convertAndSend("/topic/tables", tableDto);
                } catch (Exception ignored) {}
            }
        Order saved = orderRepository.save(order);

        // Notify role-specific channels for status changes
        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_STATUS_CHANGED",
                    "orderId", saved.getId().toString(),
                    "status", status.name(),
                    "timestamp", java.time.Instant.now().toString()
            );

            if (status == OrderStatus.READY) {
                messagingTemplate.convertAndSend("/topic/notifications/role/WAITER", payload);
            } else if (status == OrderStatus.COOKING || status == OrderStatus.PENDING || status == OrderStatus.OPEN) {
                messagingTemplate.convertAndSend("/topic/notifications/role/KITCHEN", payload);
            }

            messagingTemplate.convertAndSend("/topic/notifications/role/MANAGER", payload);
            // Send to assigned user directly if present
            try {
                var assigned = saved.getAssignedTo();
                if (assigned != null && assigned.getId() != null) {
                    messagingTemplate.convertAndSendToUser(assigned.getId().toString(), "/queue/notifications", payload);
                }
            } catch (Exception ignored) {
            }
        } catch (Exception ignored) {
        }

        return mapToResponse(saved);
    }

    // ================= HELPER =================

    private Order getOrderOrThrow(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ORDER_NOT_FOUND, "Order not found"));
    }

    private void recalculate(Order order) {
        BigDecimal total = order.getItems().stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);
    }

    private OrderResponse mapToResponse(Order order) {

        OrderResponse response = orderMapper.toResponse(order);

        List<OrderItemResponse> items = order.getItems().stream()
                .map(orderItemMapper::toResponse)
                .toList();

        response.setItems(items);

        return response;
    }

    @Override
    public OrderResponse createFromReservation(Reservation reservation) {

        Order order = Order.builder()
                .table(reservation.getTable())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse assign(UUID orderId, UUID userId) {
        Order order = getOrderOrThrow(orderId);
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        order.setAssignedTo(user);
        Order saved = orderRepository.save(order);

        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_ASSIGNED",
                    "orderId", saved.getId().toString(),
                    "message", "You have been assigned an order",
                    "timestamp", java.time.Instant.now().toString()
            );
            if (user.getId() != null) {
                messagingTemplate.convertAndSendToUser(user.getId().toString(), "/queue/notifications", payload);
            }
            messagingTemplate.convertAndSend("/topic/notifications/role/MANAGER", payload);
        } catch (Exception ignored) {}

        return mapToResponse(saved);
    }
}