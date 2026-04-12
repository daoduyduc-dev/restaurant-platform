package com.restaurant.platform.modules.dashboard.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.dashboard.dto.DashboardResponse;
import com.restaurant.platform.modules.dashboard.service.DashboardService;
import com.restaurant.platform.modules.order.dto.response.OrderResponse;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.order.mapper.OrderMapper;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<DashboardResponse> getDashboard() {
        return ApiResponse.success(dashboardService.getDashboard());
    }

    // Alerts: orders stuck in a status longer than threshold (minutes)
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<List<OrderResponse>> getAlerts(@RequestParam(defaultValue = "20") int cookThresholdMinutes) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(cookThresholdMinutes);
        List<com.restaurant.platform.modules.order.entity.Order> stuck = orderRepository.findByStatusAndCreatedDateBefore(OrderStatus.COOKING, threshold);
        List<OrderResponse> resp = stuck.stream().map(orderMapper::toResponse).toList();
        return ApiResponse.success(resp);
    }
}
