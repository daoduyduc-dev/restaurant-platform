package com.restaurant.platform.modules.reservation.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.UUID;

public interface ReservationService {

    ReservationResponse create(ReservationRequest request);

    ReservationResponse getById(UUID id);

    PageResponse<ReservationResponse> getAll(Pageable pageable);
    
    List<ReservationResponse> getAllByStatus(List<ReservationStatus> statuses);

    PageResponse<ReservationResponse> getByCustomerName(String name, Pageable pageable);

    PageResponse<ReservationResponse> getByPhone(String phone, Pageable pageable);

    ReservationResponse checkIn(UUID id);

    ReservationResponse cancel(UUID id);
}
