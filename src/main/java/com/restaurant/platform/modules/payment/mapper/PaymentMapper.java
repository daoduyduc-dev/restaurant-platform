package com.restaurant.platform.modules.payment.mapper;

import com.restaurant.platform.modules.payment.dto.reponse.PaymentResponse;
import com.restaurant.platform.modules.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    PaymentResponse toResponse(Payment payment);
}