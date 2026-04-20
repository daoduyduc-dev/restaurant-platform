package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.service.FileStorageService;
import com.restaurant.platform.modules.auth.dto.ProfileResponse;
import com.restaurant.platform.modules.auth.dto.UpdateProfileRequest;
import com.restaurant.platform.modules.auth.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final FileStorageService fileStorageService;

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

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile avatar")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        String fileName = fileStorageService.storeAvatar(file);
        String avatarUrl = "/uploads/avatars/" + fileName;
        
        // Update user profile with avatar URL
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setAvatarUrl(avatarUrl);
        profileService.updateProfile(request);
        
        return ApiResponse.success(Map.of(
                "fileName", fileName,
                "avatarUrl", avatarUrl,
                "message", "Avatar uploaded successfully"
        ));
    }
}
