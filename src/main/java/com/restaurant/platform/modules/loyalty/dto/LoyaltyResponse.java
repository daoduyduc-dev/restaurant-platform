package com.restaurant.platform.modules.loyalty.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class LoyaltyResponse {

    private UUID userId;
    private BigDecimal points;
}