package com.restaurant.platform.modules.report.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.report.dto.NoShowReportResponse;
import com.restaurant.platform.modules.report.dto.OccupancyReportResponse;
import com.restaurant.platform.modules.report.dto.RevenueReportResponse;
import com.restaurant.platform.modules.report.dto.TopSellingItemResponse;
import com.restaurant.platform.modules.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('MANAGER') and hasAuthority('REPORT_VIEW')")
    public ApiResponse<RevenueReportResponse> getRevenue() {
        return ApiResponse.success(reportService.getRevenue());
    }

    @GetMapping("/top-selling")
    public ApiResponse<List<TopSellingItemResponse>> getTopSelling(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ApiResponse.success(reportService.getTopSelling(limit));
    }

    @GetMapping("/no-show")
    public ApiResponse<NoShowReportResponse> getNoShow() {
        return ApiResponse.success(reportService.getNoShowRate());
    }

    @GetMapping("/occupancy")
    public ApiResponse<OccupancyReportResponse> getOccupancy() {
        return ApiResponse.success(reportService.getOccupancy());
    }
}