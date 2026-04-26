package com.restaurant.platform.modules.order.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.dto.request.AddOrderItemRequest;
import com.restaurant.platform.modules.order.dto.request.CreateOrderRequest;
import com.restaurant.platform.modules.order.dto.response.OrderResponse;
import com.restaurant.platform.modules.order.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    private void notifyKitchen(OrderResponse order) {
        // Publish to global orders topic
        messagingTemplate.convertAndSend("/topic/orders", order);

        // Publish to role-specific topics so clients can subscribe by role for lighter traffic
        String status = order.getStatus() != null ? order.getStatus().toUpperCase() : "";

        // Staff cares about all order updates
        messagingTemplate.convertAndSend("/topic/orders/role/STAFF", order);

        // Managers/Admins may subscribe to overall metrics or specific order updates
        messagingTemplate.convertAndSend("/topic/orders/role/MANAGER", order);

        // Also publish a per-order channel for clients that need only that order
        if (order.getId() != null) {
            messagingTemplate.convertAndSend("/topic/order/" + order.getId().toString(), order);
        }
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or (hasAnyRole('STAFF','MANAGER') and hasAuthority('ORDER_CREATE'))")
    public ApiResponse<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.create(request);
        notifyKitchen(order);
        return ApiResponse.success("Order created successfully", order);
    }

    // ================= GET =================
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrderResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(orderService.getById(id));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<OrderResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(orderService.getAll(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<OrderResponse>> getMyOrders(Authentication authentication, Pageable pageable) {
        return ApiResponse.success(orderService.getMyOrders(authentication.getName(), pageable));
    }
    
    @GetMapping(params = "status")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<OrderResponse>> getByStatus(
            @RequestParam List<com.restaurant.platform.modules.order.enums.OrderStatus> status
    ) {
        return ApiResponse.success(orderService.getAllByStatus(status));
    }

    // ================= ADD ITEM =================
    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER') and hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddOrderItemRequest request
    ) {
        OrderResponse order = orderService.addItem(id, request);
        notifyKitchen(order);
        return ApiResponse.success("Item added successfully", order);
    }

    // ================= UPDATE ITEM =================
    @PutMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER') and hasAuthority('ORDER_UPDATE')")
    public ApiResponse<OrderResponse> updateItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam Integer quantity
    ) {
        OrderResponse order = orderService.updateItem(id, itemId, quantity);
        notifyKitchen(order);
        return ApiResponse.success("Item updated successfully", order);
    }

    // ================= REMOVE ITEM =================
    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER') and hasAuthority('ORDER_UPDATE')")
    public ApiResponse<Void> removeItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId
    ) {
        orderService.removeItem(id, itemId);
        // Note: Can't easily send the updated order since we only return Void from service.
        // We'll leave it as is or fetch getById
        OrderResponse order = orderService.getById(id);
        notifyKitchen(order);
        return ApiResponse.successMessage("Item removed successfully");
    }

    // ================= PAY =================
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER') and hasAuthority('ORDER_PAY')")
    public ApiResponse<OrderResponse> pay(@PathVariable UUID id) {
        OrderResponse order = orderService.pay(id);
        notifyKitchen(order);
        return ApiResponse.success("Order paid successfully", order);
    }

    // ================= UPDATE STATUS =================
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER') and hasAnyAuthority('ORDER_UPDATE', 'ORDER_KITCHEN_UPDATE')")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam com.restaurant.platform.modules.order.enums.OrderStatus status
    ) {
        OrderResponse order = orderService.updateStatus(id, status);
        notifyKitchen(order);
        return ApiResponse.success("Order status updated successfully", order);
    }

    // ================= ASSIGN =================
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN') and hasAuthority('ORDER_ASSIGN')")
    public ApiResponse<OrderResponse> assign(@PathVariable UUID id, @RequestBody com.restaurant.platform.modules.order.dto.request.AssignOrderRequest request) {
        OrderResponse order = orderService.assign(id, request.getUserId());
        notifyKitchen(order);
        return ApiResponse.success("Order assigned successfully", order);
    }
}
