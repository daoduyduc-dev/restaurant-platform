package com.restaurant.platform.modules.reservation.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must be <= 100 characters")
    private String customerName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Invalid phone number")
    private String phone;

    @NotNull(message = "Reservation time is required")
    @Future(message = "Reservation time must be in the future")
    private LocalDateTime reservationTime;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest")
    @Max(value = 50, message = "Too many guests")
    private int numberOfGuests;

    @NotNull(message = "Table ID is required")
    private UUID tableId;
}