package com.restaurant.platform.modules.order.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.table.entity.Table;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@jakarta.persistence.Table(
        name = "orders",
        indexes = {
                @Index(name = "idx_order_table", columnList = "table_id"),
                @Index(name = "idx_order_reservation", columnList = "reservation_id")
        }
)
@SQLDelete(sql = "UPDATE orders SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Order extends SoftDeleteEntity {

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "table_id", nullable = false)
        private Table table;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "reservation_id")
        private Reservation reservation;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private OrderStatus status = OrderStatus.OPEN;

        private BigDecimal totalAmount;

        @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<OrderItem> items = new ArrayList<>();

        public void addItem(OrderItem item) {
                items.add(item);
                item.setOrder(this);
        }
}