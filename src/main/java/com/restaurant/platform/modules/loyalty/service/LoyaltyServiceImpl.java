package com.restaurant.platform.modules.loyalty.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyAccount;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyAccountRepository accountRepo;
    private final LoyaltyTransactionRepository transactionRepo;
    private final LoyaltyMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public LoyaltyResponse getMyPoints(UUID userId) {

        LoyaltyAccount acc = accountRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        return mapper.toResponse(acc);
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
                .orElseGet(() -> LoyaltyAccount.builder()
                        .userId(userId)
                        .points(BigDecimal.ZERO)
                        .build()
                );

        acc.setPoints(acc.getPoints().add(amount));
        accountRepo.save(acc);

        transactionRepo.save(
                LoyaltyTransaction.builder()
                        .userId(userId)
                        .points(amount)
                        .type(TransactionType.EARN)
                        .description("Earn from order")
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
}