package com.restaurant.platform.modules.dashboard.service;

import com.restaurant.platform.modules.dashboard.dto.*;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public DashboardResponse getDashboard() {

        DashboardResponse res = new DashboardResponse();

        // ===== TIME RANGE =====
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.plusMonths(1).withDayOfMonth(1).atStartOfDay();

        // ===== REVENUE =====
        RevenueStats revenue = new RevenueStats();

        BigDecimal total = Optional.ofNullable(orderRepository.getTotalRevenue())
                .orElse(BigDecimal.ZERO);

        BigDecimal todayRevenue = Optional.ofNullable(
                orderRepository.getRevenueBetween(startOfDay, endOfDay)
        ).orElse(BigDecimal.ZERO);

        BigDecimal monthlyRevenue = Optional.ofNullable(
                orderRepository.getRevenueBetween(startOfMonth, endOfMonth)
        ).orElse(BigDecimal.ZERO);

        revenue.setTotalRevenue(total);
        revenue.setTodayRevenue(todayRevenue);
        revenue.setMonthlyRevenue(monthlyRevenue);

        res.setRevenue(revenue);

        // ===== ORDER =====
        OrderStats orderStats = new OrderStats();

        Long totalOrders = orderRepository.count();
        Long paidOrders = orderRepository.countByStatus(
                com.restaurant.platform.modules.order.enums.OrderStatus.PAID
        );

        orderStats.setTotalOrders(totalOrders);
        orderStats.setPaidOrders(paidOrders);
        orderStats.setOpenOrders(totalOrders - paidOrders);

        res.setOrders(orderStats);

        // ===== TABLE =====
        TableStats tableStats = new TableStats();

        tableStats.setTotalTables(tableRepository.count());
        tableStats.setAvailableTables(tableRepository.countByStatus(TableStatus.AVAILABLE));
        tableStats.setOccupiedTables(tableRepository.countByStatus(TableStatus.OCCUPIED));

        res.setTables(tableStats);

        // ===== RESERVATION =====
        ReservationStats reservationStats = new ReservationStats();

        reservationStats.setTotalReservations(reservationRepository.count());
        reservationStats.setCancelledReservations(
                reservationRepository.countByStatus(ReservationStatus.CANCELLED)
        );

        res.setReservations(reservationStats);

        return res;
    }
}