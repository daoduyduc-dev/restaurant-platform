package com.restaurant.platform.modules.menu.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MenuItemResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer preparationTime;

    private UUID categoryId;
    private String categoryName;

    private Boolean isAvailable;
}