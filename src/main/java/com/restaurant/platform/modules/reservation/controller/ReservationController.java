package com.restaurant.platform.modules.reservation.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.reservation.dto.BookingWindowResponse;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.service.ReservationService;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.service.TableService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final TableService tableService;

    // ================= CREATE =================
    @PostMapping
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
    @PreAuthorize("hasRole('STAFF') and hasAuthority('RESERVATION_CHECKIN')")
    public ApiResponse<ReservationResponse> checkIn(@PathVariable UUID id) {
        return ApiResponse.success("Check-in successful",
                reservationService.checkIn(id));
    }

    // ================= UPDATE STATUS =================
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('RESERVATION_CHECKIN')")
    public ApiResponse<ReservationResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam com.restaurant.platform.modules.reservation.enums.ReservationStatus status
    ) {
        return ApiResponse.success("Reservation status updated",
                reservationService.updateStatus(id, status));
    }

    // ================= CANCEL =================
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','STAFF') and hasAuthority('RESERVATION_CANCEL')")
    public ApiResponse<ReservationResponse> cancel(@PathVariable UUID id) {
        return ApiResponse.success("Reservation cancelled",
                reservationService.cancel(id));
    }
    
    // ================= GET MY RESERVATIONS =================
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<ReservationResponse>> getMyReservations(
            Authentication authentication,
            @PageableDefault(sort = "reservationTime") Pageable pageable
    ) {
        return ApiResponse.success(reservationService.getMyReservations(authentication.getName(), pageable));
    }
    
    // ================= GET AVAILABLE TABLES =================
    @GetMapping("/available-tables")
    public ApiResponse<List<TableResponse>> getAvailableTables(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime reservationTime,
            @RequestParam int numberOfGuests
    ) {
        return ApiResponse.success(reservationService.getAvailableTables(reservationTime, numberOfGuests));
    }

    // ================= GET TABLE AVAILABILITY BY TIME SLOTS =================
    @GetMapping("/table-availability")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<com.restaurant.platform.modules.reservation.dto.TableAvailabilityResponse>> getTableAvailabilityByTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int numberOfGuests
    ) {
        return ApiResponse.success(reservationService.getTableAvailabilityByTimeSlots(date, numberOfGuests));
    }

    // ================= GET BOOKING WINDOW FOR TABLE =================
    @GetMapping("/table/{tableId}/booking-window")
    public ApiResponse<BookingWindowResponse> getBookingWindowForTable(
            @PathVariable UUID tableId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int numberOfGuests
    ) {
        return ApiResponse.success(reservationService.getBookingWindowForTable(tableId, numberOfGuests, date));
    }

    // ================= GET BOOKED SLOTS FOR TABLE =================
    @GetMapping("/table/{tableId}/booked-slots")
    public ApiResponse<List<String>> getBookedSlotsForTable(
            @PathVariable UUID tableId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate date
    ) {
        return ApiResponse.success(reservationService.getBookedSlotsForTable(tableId, date));
    }
}
