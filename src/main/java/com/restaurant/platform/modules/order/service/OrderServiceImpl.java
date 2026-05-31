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
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.loyalty.service.LoyaltyService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderServiceImpl implements OrderService {

    private static final List<OrderStatus> ACTIVE_ORDER_STATUSES = List.of(
            OrderStatus.OPEN,
            OrderStatus.PENDING,
            OrderStatus.COOKING,
            OrderStatus.READY,
            OrderStatus.SERVED
    );

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;
    private final OrderBillingService orderBillingService;

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    // ================= CREATE ORDER =================
    @Override
    public OrderResponse create(CreateOrderRequest request) {

        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.TABLE_NOT_FOUND, "Table not found"));

        Reservation reservation = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticatedUser = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());

        if (!authenticatedUser && request.getReservationId() == null) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Guest orders must be linked to an existing reservation");
        }

        if (request.getReservationId() != null) {
            reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            ErrorCode.RESERVATION_NOT_FOUND, "Reservation not found"));

            if (!reservation.getTable().getId().equals(table.getId())) {
                throw new BadRequestException(
                        ErrorCode.INVALID_INPUT,
                        "Reservation does not belong to the selected table");
            }

            if (reservation.getStatus() != ReservationStatus.RESERVED
                    && reservation.getStatus() != ReservationStatus.CHECKED_IN) {
                throw new BadRequestException(
                        ErrorCode.RESERVATION_INVALID_STATUS,
                        "Only active reservations (RESERVED or CHECKED_IN) can place orders");
            }

            String email = authenticatedUser
                    ? authentication.getName()
                    : null;

            // Only check reservation ownership for customers, not for staff
            if (email != null && reservation.getUser() != null) {
                User currentUser = userRepository.findByEmail(email).orElse(null);
                if (currentUser != null) {
                    // Check if user is STAFF or ADMIN - they can order for any reservation
                    boolean isStaffOrAdmin = currentUser.getRoles().stream()
                            .anyMatch(role -> role.getName().name().equals("STAFF") || role.getName().name().equals("ADMIN"));

                    // Only check ownership if user is not staff/admin
                    if (!isStaffOrAdmin && !reservation.getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException(
                                ErrorCode.INVALID_INPUT,
                                "This reservation belongs to another customer");
                    }
                }
            }

            Order existing = resolveActiveOrderForWrite(table, reservation);
            if (existing != null) {
                if (existing.getReservation() == null) {
                    existing.setReservation(reservation);
                }
                if (reservation.getStatus() == ReservationStatus.CHECKED_IN
                        && existing.getStatus() != OrderStatus.COOKING) {
                    existing.setStatus(OrderStatus.COOKING);
                }
                addItems(existing, request.getItems());
                return mapToResponse(orderRepository.save(existing));
            }
        } else if (table.getStatus() == TableStatus.RESERVED) {
            throw new BadRequestException(
                    ErrorCode.TABLE_NOT_AVAILABLE,
                    "Reserved tables require a matching reservation");
        } else {
            // For walk-in customers, reuse the single active order for this table if one exists
            Order existing = resolveActiveOrderForWrite(table, null);
            if (existing != null) {
                addItems(existing, request.getItems());
                return mapToResponse(orderRepository.save(existing));
            }
        }

        // Determine order status:
        // - COOKING if: no reservation (walk-in) OR reservation is CHECKED_IN
        // - OPEN if: reservation exists but not yet CHECKED_IN (pre-order)
        OrderStatus initialStatus;
        if (reservation == null) {
            // Walk-in order without reservation -> COOKING
            initialStatus = OrderStatus.COOKING;
        } else if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            // Reservation already checked in -> COOKING
            initialStatus = OrderStatus.COOKING;
        } else {
            // Reservation not yet checked in (pre-order) -> OPEN
            initialStatus = OrderStatus.OPEN;
        }

        Order order = Order.builder()
                .table(table)
                .reservation(reservation)
                .status(initialStatus)
                .totalAmount(BigDecimal.ZERO)
                .build();

        table.setStatus(TableStatus.OCCUPIED);

        // Persist table status explicitly to avoid race conditions
        tableRepository.save(table);

        // Persist order
        order = orderRepository.save(order);

        addItems(order, request.getItems());
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
            messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for order creation", e);
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
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for table update", e);
        }

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
    public PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));
        Page<Order> page = orderRepository.findByReservationUserId(user.getId(), pageable);
        return new PageResponse<>(page.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllByStatus(List<OrderStatus> statuses) {
        return orderRepository.findByStatusIn(statuses).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrders() {
        Map<UUID, Order> activeByTable = new LinkedHashMap<>();

        orderRepository.findByStatusIn(ACTIVE_ORDER_STATUSES).stream()
                .filter(order -> order.getTable() != null && order.getTable().getId() != null)
                .forEach(order -> activeByTable.merge(
                        order.getTable().getId(),
                        order,
                        this::preferOrderForDisplay
                ));

        return activeByTable.values().stream()
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

        OrderItem existing = order.getItems().stream()
                .filter(i -> i.getMenuItem().getId().equals(menuItem.getId()))
                .findFirst()
                .orElse(null);

        boolean isActiveCookingOrder =
                order.getStatus() == OrderStatus.COOKING
                        || order.getStatus() == OrderStatus.READY
                        || order.getStatus() == OrderStatus.SERVED;

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

        Order saved = orderRepository.save(order);

        try {
            if (isActiveCookingOrder) {
                var payload = java.util.Map.of(
                        "type", "ORDER_ITEM_ADDED_TO_COOKING",
                        "orderId", saved.getId().toString(),
                        "tableName", saved.getTable().getName() + " - add",
                        "message", "New add-on item for kitchen",
                        "timestamp", java.time.Instant.now().toString()
                );

                messagingTemplate.convertAndSend("/topic/orders", mapToResponse(saved));
                messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
            } else {
                var payload = java.util.Map.of(
                        "type", "ORDER_UPDATED",
                        "orderId", saved.getId().toString(),
                        "message", "Order items updated",
                        "timestamp", java.time.Instant.now().toString()
                );

                messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
            }

        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for order update", e);
        }

        return mapToResponse(saved);
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
            messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for item update", e);
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
            messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for item removal", e);
        }
    }

    // ================= PAY =================
    @Override
    public OrderResponse pay(UUID orderId) {
        Order order = getOrderOrThrow(orderId);
        Order savedOrder = finalizePayment(order);
        return mapToResponse(savedOrder);
    }

    @Override
    public OrderResponse updateStatus(UUID orderId, OrderStatus status) {
        Order order = getOrderOrThrow(orderId);
        if (status == OrderStatus.PAID) {
            Order savedOrder = finalizePayment(order);
            return mapToResponse(savedOrder);
        }

        order.setStatus(status);
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
                messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
            } else if (status == OrderStatus.COOKING || status == OrderStatus.PENDING || status == OrderStatus.OPEN) {
                messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
            }

            messagingTemplate.convertAndSend("/topic/notifications/role/ADMIN", payload);
            // Send to assigned user directly if present
            var assigned = saved.getAssignedTo();
            if (assigned != null && assigned.getId() != null) {
                try {
                    messagingTemplate.convertAndSendToUser(assigned.getId().toString(), "/queue/notifications", payload);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket notification to assigned user", e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for status change", e);
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
        if (order.getItems() == null) {
            order.setItems(new java.util.ArrayList<>());
        }
        BigDecimal total = order.getItems().stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);
    }

    private Order finalizePayment(Order order) {
        if (order.getStatus() == OrderStatus.PAID) {
            return order;
        }

        if (order.getItems().isEmpty()) {
            throw new BadRequestException(
                    ErrorCode.INVALID_INPUT,
                    "Cannot pay order without items");
        }

        order.setStatus(OrderStatus.PAID);

        Table table = order.getTable();
        if (table != null) {
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        Reservation reservation = order.getReservation();
        if (reservation != null) {
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);

            if (reservation.getUser() != null && reservation.getUser().getId() != null) {
                loyaltyService.earnPoints(
                        reservation.getUser().getId(),
                        orderBillingService.getFinalAmount(order)
                );
                loyaltyService.updateTotalSpent(
                        reservation.getUser().getId(),
                        orderBillingService.getFinalAmount(order)
                );
            }

            try {
                var resPayload = java.util.Map.of(
                        "type", "RESERVATION_COMPLETED",
                        "reservationId", reservation.getId().toString(),
                        "message", "Reservation completed",
                        "timestamp", java.time.Instant.now().toString()
                );
                messagingTemplate.convertAndSend("/topic/reservations", resPayload);
            } catch (Exception e) {
                log.error("Failed to send WebSocket notification for reservation completion", e);
            }
        }

        Order savedOrder = orderRepository.save(order);

        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_PAID",
                    "orderId", savedOrder.getId().toString(),
                    "message", "Order has been paid",
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for order payment", e);
        }

        if (table != null) {
            try {
                var tableDto = java.util.Map.of(
                        "id", table.getId().toString(),
                        "name", table.getName(),
                        "capacity", table.getCapacity(),
                        "status", table.getStatus().name()
                );
                messagingTemplate.convertAndSend("/topic/tables", tableDto);
            } catch (Exception e) {
                log.error("Failed to send WebSocket notification for table update", e);
            }
        }

        return savedOrder;
    }

    private void addItems(Order order, List<AddOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return;
        }
        if (order.getItems() == null) {
            order.setItems(new java.util.ArrayList<>());
        }

        for (AddOrderItemRequest itemRequest : items) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            ErrorCode.MENU_ITEM_NOT_FOUND, "Menu item not found"));

            if (!menuItem.getAvailable()) {
                throw new BadRequestException(
                        ErrorCode.INVALID_INPUT,
                        "Menu item is not available");
            }

            OrderItem existing = order.getItems().stream()
                    .filter(i -> i.getMenuItem().getId().equals(menuItem.getId()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + itemRequest.getQuantity());
            } else {
                order.addItem(OrderItem.builder()
                        .order(order)
                        .menuItem(menuItem)
                        .quantity(itemRequest.getQuantity())
                        .price(menuItem.getPrice())
                        .build());
            }
        }

        recalculate(order);

        if (order.getStatus() == OrderStatus.COOKING) {
            try {
                messagingTemplate.convertAndSend("/topic/orders", mapToResponse(order));
            } catch (Exception e) {
                log.error("Failed to notify kitchen for bulk add", e);
            }
        }
    }

    private OrderResponse mapToResponse(Order order) {

        OrderResponse response = orderMapper.toResponse(order);

        List<OrderItemResponse> items = order.getItems().stream()
                .map(orderItemMapper::toResponse)
                .toList();

        response.setItems(items);
        response.setVipSurchargeAmount(orderBillingService.getVipSurcharge(order));
        response.setFinalAmount(orderBillingService.getFinalAmount(order));
        response.setLoyaltyEligible(order.getReservation() != null && order.getReservation().getUser() != null);

        return response;
    }

    @Override
    public OrderResponse createFromReservation(Reservation reservation) {

        Order existingOrder = resolveActiveOrderForWrite(reservation.getTable(), reservation);

        if (existingOrder != null) {
            if (existingOrder.getReservation() == null) {
                existingOrder.setReservation(reservation);
            }
            existingOrder.setStatus(OrderStatus.COOKING);
            Order saved = orderRepository.save(existingOrder);

            try {
                var payload = java.util.Map.of(
                        "type", "ORDER_STATUS_CHANGED",
                        "orderId", saved.getId().toString(),
                        "status", "COOKING",
                        "message", "Order moved to cooking",
                        "timestamp", java.time.Instant.now().toString()
                );
                messagingTemplate.convertAndSend("/topic/orders", mapToResponse(saved));
                messagingTemplate.convertAndSend("/topic/orders/role/STAFF", mapToResponse(saved));
                messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
            } catch (Exception e) {
                log.error("Failed to send WebSocket notification for order status change", e);
            }

            return mapToResponse(saved);
        }

        // If no existing order, create a new empty order with COOKING status
        Order order = Order.builder()
                .table(reservation.getTable())
                .reservation(reservation)
                .status(OrderStatus.COOKING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        Order saved = orderRepository.save(order);

        try {
            var payload = java.util.Map.of(
                    "type", "ORDER_CREATED",
                    "orderId", saved.getId().toString(),
                    "tableId", saved.getTable().getId().toString(),
                    "message", "Order created from check-in",
                    "timestamp", java.time.Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/orders", mapToResponse(saved));
            messagingTemplate.convertAndSend("/topic/orders/role/STAFF", mapToResponse(saved));
            messagingTemplate.convertAndSend("/topic/notifications/role/STAFF", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for order creation from reservation", e);
        }

        return mapToResponse(saved);
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
            messagingTemplate.convertAndSend("/topic/notifications/role/ADMIN", payload);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for order assignment", e);
        }

        return mapToResponse(saved);
    }

    private Order resolveActiveOrderForWrite(Table table, Reservation reservation) {
        List<Order> activeOrders = orderRepository.findActiveByTableWithLock(table, ACTIVE_ORDER_STATUSES);
        if (activeOrders.isEmpty()) {
            return null;
        }

        Order canonical = chooseCanonicalOrderForWrite(activeOrders, reservation);
        if (canonical == null) {
            return null;
        }

        if (activeOrders.size() > 1) {
            mergeActiveOrders(canonical, activeOrders);
        }

        return canonical;
    }

    private Order chooseCanonicalOrderForWrite(List<Order> activeOrders, Reservation reservation) {
        if (reservation != null) {
            Optional<Order> matchingReservationOrder = activeOrders.stream()
                    .filter(order -> order.getReservation() != null
                            && reservation.getId().equals(order.getReservation().getId()))
                    .findFirst();
            if (matchingReservationOrder.isPresent()) {
                return matchingReservationOrder.get();
            }
        }

        return activeOrders.stream()
                .filter(order -> order.getItems() == null || order.getItems().isEmpty())
                .min(orderCreatedComparator())
                .orElseGet(() -> activeOrders.stream()
                        .min(orderCreatedComparator())
                        .orElse(activeOrders.get(0)));
    }

    private Comparator<Order> orderCreatedComparator() {
        return Comparator.comparing(
                Order::getCreatedDate,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).thenComparing(Order::getId, Comparator.nullsLast(Comparator.naturalOrder()));
    }

    private Order preferOrderForDisplay(Order first, Order second) {
        int firstItems = itemCount(first);
        int secondItems = itemCount(second);
        if (firstItems != secondItems) {
            return firstItems >= secondItems ? first : second;
        }

        LocalDateTime firstDate = first.getCreatedDate();
        LocalDateTime secondDate = second.getCreatedDate();
        if (firstDate == null && secondDate == null) {
            return first;
        }
        if (firstDate == null) {
            return second;
        }
        if (secondDate == null) {
            return first;
        }
        return firstDate.isAfter(secondDate) ? first : second;
    }

    private int itemCount(Order order) {
        return order.getItems() == null ? 0 : order.getItems().size();
    }

    private void mergeActiveOrders(Order canonical, List<Order> activeOrders) {
        if (canonical.getItems() == null) {
            canonical.setItems(new ArrayList<>());
        }

        for (Order candidate : activeOrders) {
            if (candidate.getId() == null || candidate.getId().equals(canonical.getId())) {
                continue;
            }

            if (canonical.getReservation() == null && candidate.getReservation() != null) {
                canonical.setReservation(candidate.getReservation());
            }

            if (candidate.getItems() != null) {
                for (OrderItem candidateItem : new ArrayList<>(candidate.getItems())) {
                    candidate.getItems().remove(candidateItem);

                    OrderItem existing = canonical.getItems().stream()
                            .filter(item -> item.getMenuItem().getId().equals(candidateItem.getMenuItem().getId()))
                            .findFirst()
                            .orElse(null);

                    if (existing != null) {
                        existing.setQuantity(existing.getQuantity() + candidateItem.getQuantity());
                    } else {
                        canonical.addItem(candidateItem);
                    }
                }
            }

            candidate.setTotalAmount(BigDecimal.ZERO);
            candidate.setStatus(OrderStatus.CANCELED);
            orderRepository.save(candidate);
        }

        recalculate(canonical);
    }
}
