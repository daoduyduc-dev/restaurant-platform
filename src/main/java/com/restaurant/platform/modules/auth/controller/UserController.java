package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.restaurant.platform.modules.auth.repository.RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<List<UserResponse>> getAll() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<UserResponse> getById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));
        return ApiResponse.success(toResponse(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(@RequestBody @jakarta.validation.Valid com.restaurant.platform.modules.auth.dto.UserCreateRequest req) {
        if(userRepository.findByEmail(req.getEmail()).isPresent()) 
            throw new BadRequestException(ErrorCode.USER_ALREADY_EXISTS, "Email already taken");
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setActive(true);
        var roles = req.getRoles().stream()
                 .map(rname -> roleRepository.findByName(rname)
                         .orElseThrow(() -> new ResourceNotFoundException(
                                 ErrorCode.ROLE_NOT_FOUND, "Role not found: " + rname)))
                 .collect(java.util.stream.Collectors.toSet());
        user.setRoles(roles);
        userRepository.save(user);
        return ApiResponse.success(toResponse(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));
        user.setActive(false); // soft delete
        userRepository.save(user);
        return ApiResponse.successMessage("Staff deleted");
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .active(user.isActive())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .toList())
                .build();
    }
}