package com.restaurant.platform.modules.dashboard.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.dashboard.dto.DashboardResponse;
import com.restaurant.platform.modules.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<DashboardResponse> getDashboard() {
        return ApiResponse.success(
                "Dashboard fetched successfully",
                dashboardService.getDashboard()
        );
    }
}