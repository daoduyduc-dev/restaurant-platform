package com.restaurant.platform.modules.report.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class HourlyTrafficResponse {
    private String hour;
    private long visitors;
}
