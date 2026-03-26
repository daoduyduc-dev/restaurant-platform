package com.restaurant.platform.modules.reservation.dto;

import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReservationResponse {

    private UUID id;

    private String customerName;

    private String phone;

    private LocalDateTime reservationTime;

    private int numberOfGuests;

    // table info (flatten)
    private UUID tableId;
    private String tableName;
    private Integer tableCapacity;

    private ReservationStatus status;

    private LocalDateTime createdAt;
}