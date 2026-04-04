package com.restaurant.platform.modules.order.mapper;

import com.restaurant.platform.modules.order.dto.response.OrderResponse;
import com.restaurant.platform.modules.order.entity.Order;

import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface OrderMapper {

    @Mapping(target = "tableId", source = "table.id")
    @Mapping(target = "tableName", source = "table.name")
    @Mapping(target = "reservationId", source = "reservation.id")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "assignedToId", source = "assignedTo.id")
    @Mapping(target = "assignedToName", source = "assignedTo.name")
    @Mapping(target = "createdAt", source = "createdDate")
    OrderResponse toResponse(Order order);
}