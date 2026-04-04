package com.restaurant.platform.modules.table.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TableRequest {

    @NotBlank
    private String name;

    @Min(1)
    private int capacity;

    private Double positionX;
    private Double positionY;
    private String zone;
}
