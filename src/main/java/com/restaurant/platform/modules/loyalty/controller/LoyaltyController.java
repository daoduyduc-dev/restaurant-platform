package com.restaurant.platform.modules.loyalty.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import com.restaurant.platform.modules.loyalty.dto.RedeemRequest;
import com.restaurant.platform.modules.loyalty.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    // 🔥 xem điểm
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') and hasAuthority('LOYALTY_VIEW')")
    public ApiResponse<LoyaltyResponse> getMyPoints(
            @RequestParam UUID userId
    ) {
        return ApiResponse.success(
                loyaltyService.getMyPoints(userId)
        );
    }

    // 🔥 lịch sử (pagination)
    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<LoyaltyTransactionResponse>> getHistory(
            @RequestParam UUID userId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                loyaltyService.getHistory(userId, pageable)
        );
    }

    // 🔥 redeem
    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CUSTOMER') and hasAuthority('LOYALTY_REDEEM')")
    public ApiResponse<Void> redeem(
            @RequestParam UUID userId,
            @Valid @RequestBody RedeemRequest request
    ) {
        loyaltyService.redeemPoints(userId, request.getPoints());
        return ApiResponse.successMessage("Redeemed successfully");
    }
}