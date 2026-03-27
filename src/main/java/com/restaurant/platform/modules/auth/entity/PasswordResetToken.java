package com.restaurant.platform.modules.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class PasswordResetToken {

    @Id
    @GeneratedValue
    private Long id;

    private String token;

    private String email;

    private Instant expiryDate;

    private boolean used;
}