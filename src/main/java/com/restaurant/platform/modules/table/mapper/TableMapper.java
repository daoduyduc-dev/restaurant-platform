package com.restaurant.platform.modules.table.mapper;

import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.entity.Table;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TableMapper {

    // Entity → Response
    TableResponse toResponse(Table entity);

    // Request → Entity
    Table toEntity(TableRequest request);

    // Update entity (QUAN TRỌNG)
    void updateEntity(@MappingTarget Table entity, TableRequest request);
}
