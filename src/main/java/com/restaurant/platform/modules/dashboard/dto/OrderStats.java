package com.restaurant.platform.modules.dashboard.dto;

import lombok.Data;

@Data
public class OrderStats {

    private Long totalOrders;
    private Long openOrders;
    private Long paidOrders;
}