package com.restaurant.platform.modules.settings.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.settings.dto.SettingsDTO;
import com.restaurant.platform.modules.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SettingsDTO> getSettings() {
        return ApiResponse.success(settingsService.getSettings());
    }

    @GetMapping("/public")
    public ApiResponse<SettingsDTO> getPublicSettings() {
        return ApiResponse.success(settingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SettingsDTO> updateSettings(@RequestBody SettingsDTO request) {
        return ApiResponse.success(settingsService.updateSettings(request));
    }
}
