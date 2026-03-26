package com.restaurant.platform.modules.dashboard.dto;

import lombok.Data;

@Data
public class ReservationStats {

    private Long totalReservations;
    private Long cancelledReservations;
}