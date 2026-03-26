package com.restaurant.platform.modules.reservation.dto;

import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import lombok.Data;

@Data
public class UpdateReservationStatusReques {
    private ReservationStatus status;
}
