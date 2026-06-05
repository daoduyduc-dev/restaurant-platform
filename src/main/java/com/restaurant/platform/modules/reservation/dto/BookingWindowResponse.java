package com.restaurant.platform.modules.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingWindowResponse {
    private LocalDate bookingDate;
    private LocalTime businessHoursStart;
    private LocalTime businessHoursEnd;
    private LocalDateTime bookingWindowStart;
    private LocalDateTime bookingWindowEnd;
    private Integer defaultDurationMinutes;
    private List<TimeSlotAvailabilityResponse> availableSlots;
}
