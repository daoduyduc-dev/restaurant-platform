package com.restaurant.platform.modules.report.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NoShowReportResponse {
    private Long totalReservations;
    private Long noShowCount;
    private Double rate;
}