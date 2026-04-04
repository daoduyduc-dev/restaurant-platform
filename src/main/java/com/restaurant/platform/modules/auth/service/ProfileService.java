package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.ProfileResponse;
import com.restaurant.platform.modules.auth.dto.UpdateProfileRequest;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileResponse getMyProfile() {
        String email = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        return ProfileResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .active(user.isActive())
                .roles(roles)
                .createdDate(user.getCreatedDate())
                .lastModifiedDate(user.getModifiedDate())
                .build();
    }

    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        String email = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (!phone.matches("^(\\+84|0)?[1-9][0-9]{8,10}$")) {
                throw new BadRequestException(ErrorCode.BAD_REQUEST, "Phone number format is invalid");
            }
            user.setPhone(phone);
        }
        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            // TODO: Implement file upload and set avatar URL
            // Note: AvatarUrl field needs to be added to User entity for proper implementation
            // For now, skipping to avoid overwriting address field
        }

        User updatedUser = userRepository.save(user);
        List<String> roles = updatedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        return ProfileResponse.builder()
                .id(updatedUser.getId().toString())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .active(updatedUser.isActive())
                .roles(roles)
                .createdDate(updatedUser.getCreatedDate())
                .lastModifiedDate(updatedUser.getModifiedDate())
                .build();
    }
}
