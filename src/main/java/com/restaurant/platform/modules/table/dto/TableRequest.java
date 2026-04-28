package com.restaurant.platform.modules.table.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.restaurant.platform.modules.table.enums.TableType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TableRequest {

    @NotBlank
    private String name;

    @Min(1)
    private int capacity;

    private Double positionX;
    private Double positionY;
    private String zone;

    @Min(1)
    private Integer floor;

    private TableType type;

    @JsonSetter("isVipRoom")
    public void setLegacyVipRoom(Boolean isVipRoom) {
        if (type == null && isVipRoom != null) {
            type = isVipRoom ? TableType.VIP : TableType.NORMAL;
        }
    }

    @JsonSetter("floorName")
    public void setLegacyFloorName(String ignored) {
        // Legacy field intentionally ignored after schema migration.
    }
}
