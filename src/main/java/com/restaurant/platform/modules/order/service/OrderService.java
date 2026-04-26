package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.order.dto.request.AddOrderItemRequest;
import com.restaurant.platform.modules.order.dto.request.CreateOrderRequest;
import com.restaurant.platform.modules.order.dto.response.OrderResponse;

import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse create(CreateOrderRequest request);

    OrderResponse getById(UUID id);

    PageResponse<OrderResponse> getAll(Pageable pageable);

    PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable);
    
    List<OrderResponse> getAllByStatus(List<OrderStatus> statuses);

    OrderResponse addItem(UUID orderId, AddOrderItemRequest request);

    OrderResponse updateItem(UUID orderId, UUID orderItemId, Integer quantity);

    void removeItem(UUID orderId, UUID orderItemId);

    OrderResponse pay(UUID orderId);

    OrderResponse updateStatus(UUID orderId, OrderStatus status);

    OrderResponse createFromReservation(Reservation reservation);
    
    OrderResponse assign(UUID orderId, UUID userId);
}
