package com.restaurant.platform.modules.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentRequest {

    @NotNull
    private UUID orderId;

    @NotNull
    private String method; // CASH / MOMO / VNPAY
}