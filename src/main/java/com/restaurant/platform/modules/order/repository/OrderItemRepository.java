package com.restaurant.platform.modules.order.repository;

import com.restaurant.platform.modules.order.entity.OrderItem;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    // 🔥 Lấy tất cả item của 1 order
    List<OrderItem> findByOrderId(UUID orderId);

    // 🔥 Xóa toàn bộ item của order (dùng khi reset)
    void deleteByOrderId(UUID orderId);

    @Query("""
SELECT oi.menuItem.id, oi.menuItem.name, SUM(oi.quantity)
FROM OrderItem oi
WHERE oi.order.status = 'PAID'
GROUP BY oi.menuItem.id, oi.menuItem.name
ORDER BY SUM(oi.quantity) DESC
""")
    List<Object[]> getTopSellingItems(Pageable pageable);
}