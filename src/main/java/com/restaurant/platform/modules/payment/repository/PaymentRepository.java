package com.restaurant.platform.modules.payment.repository;

import com.restaurant.platform.modules.payment.entity.Payment;
import com.restaurant.platform.modules.payment.enums.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByOrderId(UUID orderId);

    List<Payment> findByStatus(PaymentStatus status);
}