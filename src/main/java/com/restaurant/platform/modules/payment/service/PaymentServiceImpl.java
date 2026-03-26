package com.restaurant.platform.modules.payment.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.order.enums.OrderStatus;
import com.restaurant.platform.modules.order.repository.OrderRepository;
import com.restaurant.platform.modules.payment.dto.reponse.PaymentResponse;
import com.restaurant.platform.modules.payment.dto.request.CreatePaymentRequest;
import com.restaurant.platform.modules.payment.entity.Payment;
import com.restaurant.platform.modules.payment.enums.PaymentMethod;
import com.restaurant.platform.modules.payment.enums.PaymentStatus;
import com.restaurant.platform.modules.payment.mapper.PaymentMapper;
import com.restaurant.platform.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponse create(CreatePaymentRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ORDER_NOT_FOUND, "Order not found"));

        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.valueOf(request.getMethod()))
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .build();

        // 🔥 fake URL (sau này gắn VNPay/Momo)
        payment.setPaymentUrl("https://sandbox-payment.com/" + payment.getId());

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse handleCallback(String transactionId, boolean success) {

        Payment payment = paymentRepository.findAll().stream()
                .filter(p -> transactionId.equals(p.getTransactionId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.PAYMENT_NOT_FOUND, "Payment not found"));

        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);

            // 🔥 update order
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.PAID);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        return paymentMapper.toResponse(payment);
    }
}