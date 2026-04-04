package com.restaurant.platform.modules.reservation.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.service.ReservationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','RECEPTIONIST') and hasAuthority('RESERVATION_CREATE')")
    public ApiResponse<ReservationResponse> create(@Valid @RequestBody ReservationRequest request) {
        return ApiResponse.success("Reservation created successfully",
                reservationService.create(request));
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ApiResponse<ReservationResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(reservationService.getById(id));
    }

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<?> getAll(
            @RequestParam(required = false) List<com.restaurant.platform.modules.reservation.enums.ReservationStatus> status,
            @PageableDefault(sort = "createdDate") Pageable pageable
    ) {
        if (status != null && !status.isEmpty()) {
            return ApiResponse.success(reservationService.getAllByStatus(status));
        }
        return ApiResponse.success(reservationService.getAll(pageable));
    }

    // ================= SEARCH BY NAME =================
    @GetMapping("/search/by-name")
    public ApiResponse<PageResponse<ReservationResponse>> getByName(
            @RequestParam String name,
            Pageable pageable
    ) {
        return ApiResponse.success(
                reservationService.getByCustomerName(name, pageable)
        );
    }

    // ================= SEARCH BY PHONE =================
    @GetMapping("/search/by-phone")
    public ApiResponse<PageResponse<ReservationResponse>> getByPhone(
            @RequestParam String phone,
            Pageable pageable
    ) {
        return ApiResponse.success(
                reservationService.getByPhone(phone, pageable)
        );
    }

    // ================= CHECK-IN =================
    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasRole('RECEPTIONIST') and hasAuthority('RESERVATION_CHECKIN')")
    public ApiResponse<ReservationResponse> checkIn(@PathVariable UUID id) {
        return ApiResponse.success("Check-in successful",
                reservationService.checkIn(id));
    }

    // ================= CANCEL =================
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','RECEPTIONIST') and hasAuthority('RESERVATION_CANCEL')")
    public ApiResponse<ReservationResponse> cancel(@PathVariable UUID id) {
        return ApiResponse.success("Reservation cancelled",
                reservationService.cancel(id));
    }
}