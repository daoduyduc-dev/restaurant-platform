package com.restaurant.platform.modules.dashboard.dto;

import lombok.Data;

@Data
public class TableStats {

    private Long totalTables;
    private Long availableTables;
    private Long occupiedTables;
}