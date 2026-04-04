package com.restaurant.platform.modules.loyalty.repository;

import com.restaurant.platform.modules.loyalty.entity.LoyaltyTransaction;
import com.restaurant.platform.modules.loyalty.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LoyaltyTransactionRepository
        extends JpaRepository<LoyaltyTransaction, UUID> {

    Page<LoyaltyTransaction> findByUserId(UUID userId, Pageable pageable);

    long countByUserIdAndType(UUID userId, TransactionType type);
}
