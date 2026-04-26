package com.restaurant.platform.modules.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotAvailabilityResponse {
    private LocalDateTime timeSlot;
    private boolean available;
    private String reason; // "OCCUPIED", "RESERVED", "AVAILABLE"
}
