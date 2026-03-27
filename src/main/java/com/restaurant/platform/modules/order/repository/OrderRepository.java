package com.restaurant.platform.modules.order.repository;

import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.table.entity.Table;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    // 🔥 1. Lấy order đang mở của 1 bàn (QUAN TRỌNG NHẤT)
    Optional<Order> findByTableAndStatus(Table table, OrderStatus status);

    // 🔥 2. Check bàn đã có order OPEN chưa
    boolean existsByTableAndStatus(Table table, OrderStatus status);

    // 🔥 3. Lấy tất cả order theo status
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    // 🔥 4. Lấy order theo reservation
    Optional<Order> findByReservationId(UUID reservationId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'PAID'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PAID'")
    Long countPaidOrders();

    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();

    @Query("""
    SELECT SUM(o.totalAmount)
    FROM Order o
    WHERE o.status = 'PAID'
    AND o.createdDate BETWEEN :start AND :end
""")
    BigDecimal getRevenueBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    Long countByStatus(OrderStatus orderStatus);



    @Query("""
    SELECT SUM(o.totalAmount)
    FROM Order o
    WHERE o.status = 'PAID'
    AND o.createdDate >= :start
    AND o.createdDate < :end
""")
    BigDecimal getTodayRevenue(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
SELECT SUM(o.totalAmount)
FROM Order o
WHERE o.status = 'PAID'
AND MONTH(o.createdDate) = MONTH(CURRENT_DATE)
""")
    BigDecimal getMonthlyRevenue();

}