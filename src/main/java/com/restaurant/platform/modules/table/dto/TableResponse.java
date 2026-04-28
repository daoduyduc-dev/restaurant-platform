package com.restaurant.platform.modules.table.dto;

import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TableResponse {

    private UUID id;

    private String name;

    private int capacity;

    private TableStatus status;

    private Double positionX;
    private Double positionY;
    private String zone;

    private Integer floor;

    private TableType type;
}
