package com.restaurant.platform.modules.loyalty.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyAccount;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyTier;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyTransaction;
import com.restaurant.platform.modules.loyalty.enums.TransactionType;
import com.restaurant.platform.modules.loyalty.mapper.LoyaltyMapper;
import com.restaurant.platform.modules.loyalty.repository.LoyaltyAccountRepository;
import com.restaurant.platform.modules.loyalty.repository.LoyaltyTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyAccountRepository accountRepo;
    private final LoyaltyTransactionRepository transactionRepo;
    private final LoyaltyMapper mapper;
    private final com.restaurant.platform.modules.auth.repository.UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.restaurant.platform.modules.loyalty.dto.LoyaltyAdminResponse> getAllLoyalties() {
        java.util.List<LoyaltyAccount> accounts = accountRepo.findAll();
        java.util.List<com.restaurant.platform.modules.loyalty.dto.LoyaltyAdminResponse> result = new java.util.ArrayList<>();
        for (LoyaltyAccount acc : accounts) {
            com.restaurant.platform.modules.auth.entity.User user = userRepository.findById(acc.getUserId()).orElse(null);

            String tier = acc.getTier().name();

            long visitCount = transactionRepo.countByUserIdAndType(acc.getUserId(), TransactionType.EARN);

            result.add(com.restaurant.platform.modules.loyalty.dto.LoyaltyAdminResponse.builder()
                .id(acc.getUserId())
                .name(user != null ? user.getName() : "Unknown")
                .email(user != null ? user.getEmail() : "")
                .points(acc.getPoints())
                .tier(tier)
                .visits((int) visitCount)
                .spent(acc.getPoints().multiply(new BigDecimal("10")))
                .build());
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltyResponse getMyPoints(UUID userId) {

        LoyaltyAccount acc = accountRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        return toResponseWithTierInfo(acc);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LoyaltyTransactionResponse> getHistory(
            UUID userId,
            Pageable pageable
    ) {

        Page<LoyaltyTransaction> page =
                transactionRepo.findByUserId(userId, pageable);

        return new PageResponse<>(page.map(mapper::toResponse));
    }

    @Override
    public void earnPoints(UUID userId, BigDecimal amount) {

        LoyaltyAccount acc = accountRepo.findById(userId)
                .orElseGet(() -> {
                    LoyaltyAccount newAcc = LoyaltyAccount.builder()
                            .userId(userId)
                            .points(BigDecimal.ZERO)
                            .totalPointsEarned(BigDecimal.ZERO)
                            .totalPointsRedeemed(BigDecimal.ZERO)
                            .tier(LoyaltyTier.SILVER)
                            .build();
                    return accountRepo.save(newAcc);
                });

        if (acc.getTier() == null) {
            acc.setTier(LoyaltyTier.SILVER);
        }
        if (acc.getTotalPointsEarned() == null) {
            acc.setTotalPointsEarned(BigDecimal.ZERO);
        }

        // Calculate points: base = 1 point per $10, then apply tier multiplier
        double multiplier = acc.getTier().getPointsMultiplier();
        java.math.BigDecimal basePoints = amount.divide(BigDecimal.TEN, 0, java.math.RoundingMode.DOWN);
        BigDecimal earnedPoints = basePoints.multiply(BigDecimal.valueOf(multiplier)).setScale(0, java.math.RoundingMode.DOWN);

        acc.setPoints(acc.getPoints().add(earnedPoints));
        acc.setTotalPointsEarned(acc.getTotalPointsEarned().add(earnedPoints));
        acc.setTier(LoyaltyTier.fromTotalPoints(acc.getTotalPointsEarned().intValue()));
        acc.setLastUpdated(LocalDateTime.now());
        accountRepo.save(acc);

        transactionRepo.save(
                LoyaltyTransaction.builder()
                        .userId(userId)
                        .points(earnedPoints)
                        .type(TransactionType.EARN)
                        .description("Earn from order - " + acc.getTier().name() + " tier (" + multiplier + "x)")
                        .build()
        );
    }

    @Override
    public void redeemPoints(UUID userId, BigDecimal points) {

        LoyaltyAccount acc = accountRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        if (acc.getPoints().compareTo(points) < 0) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    "Not enough points"
            );
        }

        acc.setPoints(acc.getPoints().subtract(points));
        acc.setTotalPointsRedeemed(acc.getTotalPointsRedeemed().add(points));
        acc.setLastUpdated(LocalDateTime.now());
        accountRepo.save(acc);

        transactionRepo.save(
                LoyaltyTransaction.builder()
                        .userId(userId)
                        .points(points)
                        .type(TransactionType.REDEEM)
                        .description("Redeem points")
                        .build()
        );
    }

    private LoyaltyResponse toResponseWithTierInfo(LoyaltyAccount acc) {
        LoyaltyTier currentTier = acc.getTier();
        LoyaltyTier nextTier = getNextTier(currentTier);
        
        int pointsToNext = nextTier != null ? 
                nextTier.getRequiredPoints() - acc.getTotalPointsEarned().intValue() : 0;

        return LoyaltyResponse.builder()
                .userId(acc.getUserId())
                .points(acc.getPoints())
                .tier(acc.getTier())
                .totalPointsEarned(acc.getTotalPointsEarned())
                .totalPointsRedeemed(acc.getTotalPointsRedeemed())
                .pointsMultiplier(currentTier.getPointsMultiplier())
                .pointsToNextTier(pointsToNext)
                .nextTier(nextTier != null ? nextTier.name() : "MAX")
                .lastUpdated(acc.getLastUpdated())
                .build();
    }

    private LoyaltyTier getNextTier(LoyaltyTier currentTier) {
        return switch (currentTier) {
            case SILVER -> LoyaltyTier.GOLD;
            case GOLD -> LoyaltyTier.PLATINUM;
            case PLATINUM -> LoyaltyTier.DIAMOND;
            case DIAMOND -> null;
        };
    }
}