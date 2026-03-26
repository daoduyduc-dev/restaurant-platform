package com.restaurant.platform.modules.payment.dto.reponse;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentResponse {

    private UUID id;
    private UUID orderId;

    private String method;
    private String status;

    private BigDecimal amount;

    private String paymentUrl;
}