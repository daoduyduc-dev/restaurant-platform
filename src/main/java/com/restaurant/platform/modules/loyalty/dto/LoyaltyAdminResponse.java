package com.restaurant.platform.modules.loyalty.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class LoyaltyAdminResponse {
    private UUID id;
    private String name;
    private String email;
    private BigDecimal points;
    private String tier;
    private Integer visits;
    private BigDecimal spent;
}
