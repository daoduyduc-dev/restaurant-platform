package com.restaurant.platform.modules.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDTO {
    private String restaurantName;
    private String email;
    private String phone;
    private String address;
    private String openingTime;
    private String closingTime;
    private Integer noShowGracePeriod;
    private Integer defaultReservationDuration;
    private Integer loyaltyPointsPerDollar;
    private Boolean autoAssignWaiter;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean darkMode;
    private String language;
}
