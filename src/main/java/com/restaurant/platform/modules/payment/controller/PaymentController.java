package com.restaurant.platform.modules.payment.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.payment.dto.reponse.PaymentResponse;
import com.restaurant.platform.modules.payment.dto.request.CreatePaymentRequest;
import com.restaurant.platform.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> create(
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        return ApiResponse.success("Payment created",
                paymentService.create(request));
    }

    // 🔥 giả lập callback từ cổng thanh toán
    @PostMapping("/callback")
    public ApiResponse<PaymentResponse> callback(
            @RequestParam String transactionId,
            @RequestParam boolean success
    ) {
        return ApiResponse.success(
                paymentService.handleCallback(transactionId, success)
        );
    }
}