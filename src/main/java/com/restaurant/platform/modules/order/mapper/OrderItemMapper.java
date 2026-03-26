package com.restaurant.platform.modules.order.mapper;

import com.restaurant.platform.modules.order.dto.response.OrderItemResponse;
import com.restaurant.platform.modules.order.entity.OrderItem;

import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface OrderItemMapper {

    @Mapping(target = "menuItemId", source = "menuItem.id")
    @Mapping(target = "menuItemName", source = "menuItem.name")
    @Mapping(target = "total", expression = "java(orderItem.getTotal())")
    OrderItemResponse toResponse(OrderItem orderItem);
}