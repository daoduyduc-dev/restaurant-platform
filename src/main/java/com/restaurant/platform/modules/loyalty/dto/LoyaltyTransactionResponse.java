package com.restaurant.platform.modules.loyalty.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LoyaltyTransactionResponse {

    private UUID id;
    private BigDecimal points;
    private String type;
    private String description;
    private LocalDateTime createdDate;
}