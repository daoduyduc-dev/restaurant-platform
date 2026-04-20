package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.table.dto.TableResponse;
import org.springframework.data.domain.Pageable;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationService {

    ReservationResponse create(ReservationRequest request);

    ReservationResponse getById(UUID id);

    PageResponse<ReservationResponse> getAll(Pageable pageable);
    
    List<ReservationResponse> getAllByStatus(List<ReservationStatus> statuses);

    PageResponse<ReservationResponse> getByCustomerName(String name, Pageable pageable);

    PageResponse<ReservationResponse> getByPhone(String phone, Pageable pageable);

    PageResponse<ReservationResponse> getMyReservations(String email, Pageable pageable);
    
    List<TableResponse> getAvailableTables(LocalDateTime reservationTime, int numberOfGuests);

    ReservationResponse checkIn(UUID id);

    ReservationResponse cancel(UUID id);
}
