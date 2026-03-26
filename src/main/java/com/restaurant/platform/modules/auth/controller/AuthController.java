package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.AuthRequest;
import com.restaurant.platform.modules.auth.dto.AuthResponse;
import com.restaurant.platform.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @RequestBody @Valid AuthRequest request
    ) {
        return ApiResponse.success(authService.login(request));
    }
}