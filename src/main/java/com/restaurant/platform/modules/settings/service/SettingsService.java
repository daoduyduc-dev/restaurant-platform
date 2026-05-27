package com.restaurant.platform.modules.settings.service;

import com.restaurant.platform.modules.settings.dto.SettingsDTO;
import com.restaurant.platform.modules.settings.entity.RestaurantSettings;
import com.restaurant.platform.modules.settings.repository.RestaurantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class SettingsService {

    private final RestaurantSettingsRepository repository;

    @Transactional(readOnly = true)
    public SettingsDTO getSettings() {
        return toDto(getOrCreateSettings());
    }

    public SettingsDTO updateSettings(SettingsDTO request) {
        RestaurantSettings settings = getOrCreateSettings();
        settings.setRestaurantName(request.getRestaurantName());
        settings.setEmail(request.getEmail());
        settings.setPhone(request.getPhone());
        settings.setAddress(request.getAddress());
        settings.setOpeningTime(request.getOpeningTime());
        settings.setClosingTime(request.getClosingTime());
        settings.setNoShowGracePeriod(request.getNoShowGracePeriod());
        settings.setDefaultReservationDuration(request.getDefaultReservationDuration());
        settings.setLoyaltyPointsPerDollar(request.getLoyaltyPointsPerDollar());
        settings.setVipTableFee(request.getVipTableFee());
        settings.setAutoAssignWaiter(request.getAutoAssignWaiter());
        settings.setEmailNotifications(request.getEmailNotifications());
        settings.setSmsNotifications(request.getSmsNotifications());
        settings.setDarkMode(request.getDarkMode());
        settings.setLanguage(request.getLanguage());

        return toDto(repository.save(settings));
    }

    private RestaurantSettings getOrCreateSettings() {
        return repository.findTopByOrderByCreatedDateAsc()
                .orElseGet(() -> repository.save(RestaurantSettings.builder().build()));
    }

    private SettingsDTO toDto(RestaurantSettings settings) {
        return SettingsDTO.builder()
                .restaurantName(settings.getRestaurantName())
                .email(settings.getEmail())
                .phone(settings.getPhone())
                .address(settings.getAddress())
                .openingTime(settings.getOpeningTime())
                .closingTime(settings.getClosingTime())
                .noShowGracePeriod(settings.getNoShowGracePeriod())
                .defaultReservationDuration(settings.getDefaultReservationDuration())
                .loyaltyPointsPerDollar(settings.getLoyaltyPointsPerDollar())
                .vipTableFee(settings.getVipTableFee())
                .autoAssignWaiter(settings.getAutoAssignWaiter())
                .emailNotifications(settings.getEmailNotifications())
                .smsNotifications(settings.getSmsNotifications())
                .darkMode(settings.getDarkMode())
                .language(settings.getLanguage())
                .build();
    }
}
