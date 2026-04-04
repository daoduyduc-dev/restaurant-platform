package com.restaurant.platform.modules.loyalty.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "loyalty_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyAccount {

    @Id
    private UUID userId;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal points = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoyaltyTier tier = LoyaltyTier.SILVER;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal totalPointsEarned = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal totalPointsRedeemed = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}