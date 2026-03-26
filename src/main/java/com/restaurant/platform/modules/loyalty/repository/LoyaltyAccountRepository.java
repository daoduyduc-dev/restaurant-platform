package com.restaurant.platform.modules.loyalty.repository;

import com.restaurant.platform.modules.loyalty.entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LoyaltyAccountRepository
        extends JpaRepository<LoyaltyAccount, UUID> {
}