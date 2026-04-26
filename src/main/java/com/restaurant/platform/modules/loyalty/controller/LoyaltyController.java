package com.restaurant.platform.modules.loyalty.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import com.restaurant.platform.modules.loyalty.dto.RedeemRequest;
import com.restaurant.platform.modules.loyalty.service.LoyaltyService;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserRepository userRepository;

    // 🔥 xem điểm
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') and hasAuthority('LOYALTY_VIEW')")
    public ApiResponse<LoyaltyResponse> getMyPoints(
            @RequestParam(required = false) UUID userId,
            Authentication authentication
    ) {
        return ApiResponse.success(
                loyaltyService.getMyPoints(resolveUserId(userId, authentication))
        );
    }

    // 🔥 lịch sử (pagination)
    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<LoyaltyTransactionResponse>> getHistory(
            @RequestParam(required = false) UUID userId,
            Authentication authentication,
            Pageable pageable
    ) {
        return ApiResponse.success(
                loyaltyService.getHistory(resolveUserId(userId, authentication), pageable)
        );
    }

    // 🔥 redeem
    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CUSTOMER') and hasAuthority('LOYALTY_REDEEM')")
    public ApiResponse<Void> redeem(
            @RequestParam(required = false) UUID userId,
            Authentication authentication,
            @Valid @RequestBody RedeemRequest request
    ) {
        loyaltyService.redeemPoints(resolveUserId(userId, authentication), request.getPoints());
        return ApiResponse.successMessage("Redeemed successfully");
    }

    // 🔥 admin get all
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<java.util.List<com.restaurant.platform.modules.loyalty.dto.LoyaltyAdminResponse>> getAll() {
        return ApiResponse.success(loyaltyService.getAllLoyalties());
    }

    private UUID resolveUserId(UUID userId, Authentication authentication) {
        if (userId != null) {
            return userId;
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"))
                .getId();
    }
}
