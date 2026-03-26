package com.restaurant.platform.modules.report.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OccupancyReportResponse {
    private Long totalTables;
    private Long occupiedTables;
    private Double occupancyRate;
}