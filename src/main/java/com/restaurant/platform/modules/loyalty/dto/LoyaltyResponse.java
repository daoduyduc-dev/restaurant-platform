package com.restaurant.platform.modules.loyalty.dto;

import com.restaurant.platform.modules.loyalty.entity.LoyaltyTier;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LoyaltyResponse {

    private UUID userId;
    private BigDecimal points;
    private LoyaltyTier tier;
    private BigDecimal totalPointsEarned;
    private BigDecimal totalPointsRedeemed;
    private double pointsMultiplier;
    private int pointsToNextTier;
    private String nextTier;
    private LocalDateTime lastUpdated;
}