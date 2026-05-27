package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.settings.service.SettingsService;
import com.restaurant.platform.modules.table.enums.TableType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderBillingService {

    private final SettingsService settingsService;

    public BigDecimal getSubtotal(Order order) {
        return order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
    }

    public BigDecimal getVipSurcharge(Order order) {
        if (order == null || order.getTable() == null || order.getTable().getType() != TableType.VIP) {
            return BigDecimal.ZERO;
        }

        BigDecimal vipTableFee = settingsService.getSettings().getVipTableFee();
        return vipTableFee == null ? BigDecimal.ZERO : vipTableFee;
    }

    public BigDecimal getFinalAmount(Order order) {
        return getSubtotal(order).add(getVipSurcharge(order));
    }
}
