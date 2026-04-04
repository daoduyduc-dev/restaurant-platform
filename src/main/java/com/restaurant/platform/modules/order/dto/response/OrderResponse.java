package com.restaurant.platform.modules.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderResponse {

    private UUID id;

    private UUID tableId;
    private String tableName;

    private UUID reservationId;

    private String status;

    private BigDecimal totalAmount;

    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;
    private String assignedToId;
    private String assignedToName;
}