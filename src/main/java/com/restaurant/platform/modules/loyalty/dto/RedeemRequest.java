package com.restaurant.platform.modules.loyalty.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RedeemRequest {

    @NotNull
    @Positive
    private BigDecimal points;
}