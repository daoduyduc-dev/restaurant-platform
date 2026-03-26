package com.restaurant.platform.modules.order.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Table ID is required")
    private UUID tableId;

    private UUID reservationId; // optional
}