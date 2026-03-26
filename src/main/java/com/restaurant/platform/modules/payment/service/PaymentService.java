package com.restaurant.platform.modules.payment.service;

import com.restaurant.platform.modules.payment.dto.reponse.PaymentResponse;
import com.restaurant.platform.modules.payment.dto.request.CreatePaymentRequest;

public interface PaymentService {

    PaymentResponse create(CreatePaymentRequest request);

    PaymentResponse handleCallback(String transactionId, boolean success);
}