package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.dto.request.AddOrderItemRequest;
import com.restaurant.platform.modules.order.dto.request.CreateOrderRequest;
import com.restaurant.platform.modules.order.dto.response.OrderResponse;

import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface OrderService {

    OrderResponse create(CreateOrderRequest request);

    OrderResponse getById(UUID id);

    PageResponse<OrderResponse> getAll(Pageable pageable);

    OrderResponse addItem(UUID orderId, AddOrderItemRequest request);

    OrderResponse updateItem(UUID orderId, UUID orderItemId, Integer quantity);

    void removeItem(UUID orderId, UUID orderItemId);

    OrderResponse pay(UUID orderId);

}