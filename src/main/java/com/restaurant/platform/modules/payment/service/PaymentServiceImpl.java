package com.restaurant.platform.modules.payment.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.EmailService;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final EmailService emailService;

    @Value("${payment.gateway.vnpay.url:https://sandbox.vnpayment.vn/paymentgate/Embedded}")
    private String vnpayUrl;

    @Value("${payment.gateway.momo.url:https://test-payment.momo.vn/web/paymentgateway}")
    private String momoUrl;

    @Value("${payment.gateway.default.url:https://payment-gateway.restaurant.local/callback}")
    private String defaultUrl;

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

        payment = paymentRepository.save(payment);

        payment.setPaymentUrl(generatePaymentUrl(payment, request.getMethod()));

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    private String generatePaymentUrl(Payment payment, String method) {
        String token = payment.getId().toString();
        if ("VNPAY".equalsIgnoreCase(method)) {
            return vnpayUrl + "?token=" + token;
        } else if ("MOMO".equalsIgnoreCase(method)) {
            return momoUrl + "?token=" + token;
        } else {
            return defaultUrl.endsWith("/") ? defaultUrl + token : defaultUrl + "/" + token;
        }
    }

    @Override
    public PaymentResponse handleCallback(String transactionId, boolean success) {

        if (transactionId == null || transactionId.isEmpty()) {
            throw new ResourceNotFoundException(
                    ErrorCode.PAYMENT_NOT_FOUND, "Transaction ID cannot be empty");
        }

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.PAYMENT_NOT_FOUND, "Payment not found for transaction ID: " + transactionId));

        // Idempotency: only process if payment is in PENDING status
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return paymentMapper.toResponse(payment);
        }

        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);

            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
            } else {
                throw new ResourceNotFoundException(
                        ErrorCode.ORDER_NOT_FOUND, "Order not found for payment");
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }
}