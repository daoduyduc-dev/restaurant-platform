package com.restaurant.platform.modules.settings.entity;

import com.restaurant.platform.common.base.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "restaurant_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSettings extends AuditableEntity {

    @Column(nullable = false, length = 150)
    @Builder.Default
    private String restaurantName = "ServeGenius Restaurant";

    @Column(nullable = false, length = 150)
    @Builder.Default
    private String email = "contact@servegenius.com";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String phone = "+84 901 234 567";

    @Column(nullable = false, length = 255)
    @Builder.Default
    private String address = "123 Nguyen Hue, District 1, Ho Chi Minh City";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String openingTime = "10:00";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String closingTime = "22:00";

    @Column(nullable = false)
    @Builder.Default
    private Integer noShowGracePeriod = 20;

    @Column(nullable = false)
    @Builder.Default
    private Integer defaultReservationDuration = 90;

    @Column(nullable = false)
    @Builder.Default
    private Integer loyaltyPointsPerDollar = 1;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal vipTableFee = new BigDecimal("25.00");

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoAssignWaiter = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean smsNotifications = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean darkMode = false;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String language = "en";
}
