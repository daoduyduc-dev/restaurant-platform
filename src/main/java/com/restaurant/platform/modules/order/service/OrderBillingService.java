package com.restaurant.platform.modules.order.service;

import com.restaurant.platform.modules.loyalty.entity.LoyaltyTier;
import com.restaurant.platform.modules.loyalty.repository.LoyaltyAccountRepository;
import com.restaurant.platform.modules.order.entity.Order;
import com.restaurant.platform.modules.settings.service.SettingsService;
import com.restaurant.platform.modules.table.enums.TableType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderBillingService {

    private final SettingsService settingsService;
    private final LoyaltyAccountRepository loyaltyAccountRepository;

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

    public BigDecimal getDiscountByRank(Order order) {
        if (order == null || order.getReservation() == null || order.getReservation().getUser() == null) {
            return BigDecimal.ZERO;
        }

        UUID userId = order.getReservation().getUser().getId();
        var loyaltyAccount = loyaltyAccountRepository.findById(userId).orElse(null);
        if (loyaltyAccount == null || loyaltyAccount.getTier() == null) {
            return BigDecimal.ZERO;
        }

        LoyaltyTier tier = loyaltyAccount.getTier();
        BigDecimal discountPercent = BigDecimal.valueOf(tier.getDiscountPercent());
        
        // Calculate subtotal + surcharge first, then apply discount
        BigDecimal subtotal = getSubtotal(order);
        BigDecimal surcharge = getVipSurcharge(order);
        BigDecimal baseAmount = subtotal.add(surcharge);
        
        // Discount = baseAmount * (discountPercent / 100)
        return baseAmount.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getFinalAmount(Order order) {
        BigDecimal subtotal = getSubtotal(order);
        BigDecimal surcharge = getVipSurcharge(order);
        BigDecimal discount = getDiscountByRank(order);
        return subtotal.add(surcharge).subtract(discount);
    }

    public BigDecimal getGroupSubtotal(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return orders.stream()
                .map(this::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getGroupVipSurcharge(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return orders.stream().anyMatch(order -> getVipSurcharge(order).compareTo(BigDecimal.ZERO) > 0)
                ? getVipSurcharge(orders.get(0))
                : BigDecimal.ZERO;
    }

    public BigDecimal getGroupDiscount(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return BigDecimal.ZERO;
        }

        Order referenceOrder = orders.get(0);
        if (referenceOrder.getReservation() == null || referenceOrder.getReservation().getUser() == null) {
            return BigDecimal.ZERO;
        }

        UUID userId = referenceOrder.getReservation().getUser().getId();
        var loyaltyAccount = loyaltyAccountRepository.findById(userId).orElse(null);
        if (loyaltyAccount == null || loyaltyAccount.getTier() == null) {
            return BigDecimal.ZERO;
        }

        LoyaltyTier tier = loyaltyAccount.getTier();
        BigDecimal discountPercent = BigDecimal.valueOf(tier.getDiscountPercent());
        BigDecimal baseAmount = getGroupSubtotal(orders).add(getGroupVipSurcharge(orders));

        return baseAmount.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getGroupFinalAmount(List<Order> orders) {
        BigDecimal subtotal = getGroupSubtotal(orders);
        BigDecimal surcharge = getGroupVipSurcharge(orders);
        BigDecimal discount = getGroupDiscount(orders);
        return subtotal.add(surcharge).subtract(discount);
    }
}
