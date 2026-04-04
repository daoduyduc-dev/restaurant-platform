package com.restaurant.platform.modules.order.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignOrderRequest {
    private UUID userId;
}
