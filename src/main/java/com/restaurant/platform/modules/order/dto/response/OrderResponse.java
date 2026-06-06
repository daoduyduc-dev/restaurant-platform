package com.restaurant.platform.modules.order.dto.response;

import com.restaurant.platform.modules.table.enums.TableType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderResponse {

    private UUID id;

    private UUID tableId;
    private String tableName;
    private String displayLabel;
    private TableType tableType;

    private UUID reservationId;

    private String status;
    private boolean supplemental;

    private BigDecimal totalAmount;
    private BigDecimal vipSurchargeAmount;
    private BigDecimal finalAmount;
    private Boolean loyaltyEligible;
    private BigDecimal groupSubtotalAmount;
    private BigDecimal groupVipSurchargeAmount;
    private BigDecimal groupFinalAmount;

    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;
    private String assignedToId;
    private String assignedToName;
}
