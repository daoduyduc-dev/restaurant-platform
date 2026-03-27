package com.restaurant.platform.modules.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "blacklisted_tokens")
@Getter
@Setter
public class BlacklistedToken {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    private Instant expiryDate;
}