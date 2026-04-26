package com.restaurant.platform.modules.reservation.dto;

import com.restaurant.platform.modules.table.dto.TableResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableAvailabilityResponse {
    private TableResponse table;
    private List<TimeSlotAvailabilityResponse> timeSlots;
}
