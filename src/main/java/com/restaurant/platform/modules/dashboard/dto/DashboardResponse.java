package com.restaurant.platform.modules.dashboard.dto;

import lombok.Data;

@Data
public class DashboardResponse {

    private RevenueStats revenue;
    private OrderStats orders;
    private TableStats tables;
    private ReservationStats reservations;
}