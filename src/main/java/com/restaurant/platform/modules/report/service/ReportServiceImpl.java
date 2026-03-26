package com.restaurant.platform.modules.report.service;

import com.restaurant.platform.modules.order.repository.OrderItemRepository;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.report.dto.NoShowReportResponse;
import com.restaurant.platform.modules.report.dto.OccupancyReportResponse;
import com.restaurant.platform.modules.report.dto.RevenueReportResponse;
import com.restaurant.platform.modules.report.dto.TopSellingItemResponse;
import com.restaurant.platform.modules.report.service.ReportService;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;

    @Override
    public RevenueReportResponse getRevenue() {

        BigDecimal total = Optional.ofNullable(orderRepository.getTotalRevenue()).orElse(BigDecimal.ZERO);
        BigDecimal today = Optional.ofNullable(orderRepository.getTodayRevenue()).orElse(BigDecimal.ZERO);
        BigDecimal month = Optional.ofNullable(orderRepository.getMonthlyRevenue()).orElse(BigDecimal.ZERO);

        return RevenueReportResponse.builder()
                .totalRevenue(total)
                .todayRevenue(today)
                .monthlyRevenue(month)
                .build();
    }

    @Override
    public List<TopSellingItemResponse> getTopSelling(int limit) {

        List<Object[]> data = orderItemRepository.getTopSellingItems(PageRequest.of(0, limit));

        return data.stream().map(row -> TopSellingItemResponse.builder()
                .menuItemId((UUID) row[0])
                .name((String) row[1])
                .totalQuantity((Long) row[2])
                .build()
        ).toList();
    }

    @Override
    public NoShowReportResponse getNoShowRate() {

        Long total = reservationRepository.countAll();
        Long noShow = reservationRepository.countNoShow();

        double rate = total == 0 ? 0 : (double) noShow / total;

        return NoShowReportResponse.builder()
                .totalReservations(total)
                .noShowCount(noShow)
                .rate(rate)
                .build();
    }

    @Override
    public OccupancyReportResponse getOccupancy() {

        Long total = tableRepository.count();
        Long occupied = tableRepository.countByStatus(TableStatus.OCCUPIED);

        double rate = total == 0 ? 0 : (double) occupied / total;

        return OccupancyReportResponse.builder()
                .totalTables(total)
                .occupiedTables(occupied)
                .occupancyRate(rate)
                .build();
    }
}