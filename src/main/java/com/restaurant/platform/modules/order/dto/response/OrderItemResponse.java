package com.restaurant.platform.modules.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemResponse {

    private UUID id;

    private UUID menuItemId;
    private String menuItemName;

    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
}