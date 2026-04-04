package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.ProfileResponse;
import com.restaurant.platform.modules.auth.dto.UpdateProfileRequest;
import com.restaurant.platform.modules.auth.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ProfileResponse> getMyProfile() {
        return ApiResponse.success(profileService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ProfileResponse> updateProfile(
            @RequestBody @Valid UpdateProfileRequest request
    ) {
        return ApiResponse.success(profileService.updateProfile(request));
    }
}
