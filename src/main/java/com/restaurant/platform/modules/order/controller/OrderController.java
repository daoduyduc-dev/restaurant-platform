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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ================= CREATE =================
    @PostMapping
    public ApiResponse<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.success("Order created successfully",
                orderService.create(request));
    }

    // ================= GET =================
    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(orderService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(orderService.getAll(pageable));
    }

    // ================= ADD ITEM =================
    @PostMapping("/{id}/items")
    public ApiResponse<OrderResponse> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddOrderItemRequest request
    ) {
        return ApiResponse.success("Item added successfully",
                orderService.addItem(id, request));
    }

    // ================= UPDATE ITEM =================
    @PutMapping("/{id}/items/{itemId}")
    public ApiResponse<OrderResponse> updateItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam Integer quantity
    ) {
        return ApiResponse.success("Item updated successfully",
                orderService.updateItem(id, itemId, quantity));
    }

    // ================= REMOVE ITEM =================
    @DeleteMapping("/{id}/items/{itemId}")
    public ApiResponse<Void> removeItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId
    ) {
        orderService.removeItem(id, itemId);
        return ApiResponse.successMessage("Item removed successfully");
    }

    // ================= PAY =================
    @PostMapping("/{id}/pay")
    public ApiResponse<OrderResponse> pay(@PathVariable UUID id) {
        return ApiResponse.success("Order paid successfully",
                orderService.pay(id));
    }
}