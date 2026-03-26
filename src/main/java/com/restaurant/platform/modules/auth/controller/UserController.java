package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;
import com.restaurant.platform.modules.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> createUser(
            @RequestBody @Valid UserCreateRequest request
    ) {
        return ApiResponse.success(userService.createUser(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody @Valid UserUpdateRequest request
    ) {
        return ApiResponse.success(userService.updateUser(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponse.success(null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{name}")
    public ApiResponse<UserResponse> getUserByName(@PathVariable String name) {
        return ApiResponse.success(
                userService.getUserByName(name)
        );
    }
}