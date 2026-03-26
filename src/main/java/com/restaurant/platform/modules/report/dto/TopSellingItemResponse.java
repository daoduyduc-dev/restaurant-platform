package com.restaurant.platform.modules.report.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class TopSellingItemResponse {
    private UUID menuItemId;
    private String name;
    private Long totalQuantity;
}