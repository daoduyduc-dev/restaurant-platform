package com.restaurant.platform.modules.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevenueStats {

    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
}