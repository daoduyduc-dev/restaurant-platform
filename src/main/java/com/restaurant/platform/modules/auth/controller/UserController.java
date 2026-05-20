package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.RoleRepository;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAll() {
        List<UserResponse> users = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(role ->
                        role.getName().name().equals("ADMIN") || role.getName().name().equals("STAFF")))
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> getById(@PathVariable UUID id) {
        User user = getUser(id);
        return ApiResponse.success(toResponse(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(@RequestBody @Valid UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException(ErrorCode.USER_ALREADY_EXISTS, "Email already taken");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setRoles(resolveRoles(request.getRoles()));

        userRepository.save(user);
        return ApiResponse.success(toResponse(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> update(@PathVariable UUID id, @RequestBody @Valid UserUpdateRequest request) {
        User user = getUser(id);

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        userRepository.save(user);
        return ApiResponse.success(toResponse(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        User user = getUser(id);
        user.setActive(false);
        userRepository.save(user);
        return ApiResponse.successMessage("Staff deleted");
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));
    }

    private Set<com.restaurant.platform.modules.auth.entity.Role> resolveRoles(
            Set<com.restaurant.platform.modules.auth.entity.RoleName> roleNames
    ) {
        return roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                ErrorCode.ROLE_NOT_FOUND, "Role not found: " + roleName)))
                .collect(Collectors.toSet());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .active(user.isActive())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList())
                .build();
    }
}
