package com.restaurant.platform.modules.reservation.mapper;

import com.restaurant.platform.modules.reservation.dto.ReservationRequest;
import com.restaurant.platform.modules.reservation.dto.ReservationResponse;
import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.table.entity.Table;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ReservationMapper {
    // request → entity
    @Mapping(target = "table", source = "table")
    @Mapping(target = "status", constant = "RESERVED")
    Reservation toEntity(ReservationRequest request, Table table);

    // entity → response
    @Mapping(target = "createdAt", source = "createdDate")
    @Mapping(target = "tableId", source = "table.id")
    @Mapping(target = "tableName", source = "table.name")
    @Mapping(target = "tableCapacity", source = "table.capacity")
    ReservationResponse toResponse(Reservation reservation);

    void update(@MappingTarget Reservation entity, ReservationRequest request);
}
