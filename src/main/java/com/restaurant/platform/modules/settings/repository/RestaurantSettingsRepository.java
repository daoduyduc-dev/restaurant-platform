package com.restaurant.platform.modules.settings.repository;

import com.restaurant.platform.modules.settings.entity.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, UUID> {
    Optional<RestaurantSettings> findTopByOrderByCreatedDateAsc();
}
