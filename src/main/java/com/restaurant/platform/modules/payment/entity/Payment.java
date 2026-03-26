package com.restaurant.platform.modules.payment.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.payment.enums.PaymentMethod;
import com.restaurant.platform.modules.payment.enums.PaymentStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "payments",
        indexes = {
                @Index(name = "idx_payment_order", columnList = "order_id")
        }
)
@SQLDelete(sql = "UPDATE payments SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private BigDecimal amount;

    private String transactionId; // từ cổng thanh toán

    private String paymentUrl; // link redirect (VNPay/Momo)
}