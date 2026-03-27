package com.restaurant.platform.modules.auth.repository;

import com.restaurant.platform.modules.auth.entity.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistRepository extends JpaRepository<BlacklistedToken, Long> {
    boolean existsByToken(String token);
}