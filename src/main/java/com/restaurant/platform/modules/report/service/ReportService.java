package com.restaurant.platform.modules.report.service;

import com.restaurant.platform.modules.report.dto.NoShowReportResponse;
import com.restaurant.platform.modules.report.dto.OccupancyReportResponse;
import com.restaurant.platform.modules.report.dto.RevenueReportResponse;
import com.restaurant.platform.modules.report.dto.TopSellingItemResponse;
import com.restaurant.platform.modules.report.dto.HourlyTrafficResponse;

import java.util.List;

public interface ReportService {

    RevenueReportResponse getRevenue();

    List<TopSellingItemResponse> getTopSelling(int limit);

    NoShowReportResponse getNoShowRate();

    OccupancyReportResponse getOccupancy();

    List<HourlyTrafficResponse> getHourlyTraffic();
}