package com.restaurant.platform.modules.loyalty.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface LoyaltyService {

    LoyaltyResponse getMyPoints(UUID userId);

    PageResponse<LoyaltyTransactionResponse> getHistory(UUID userId, Pageable pageable);

    void earnPoints(UUID userId, BigDecimal amount);

    void redeemPoints(UUID userId, BigDecimal points);

    java.util.List<com.restaurant.platform.modules.loyalty.dto.LoyaltyAdminResponse> getAllLoyalties();
}