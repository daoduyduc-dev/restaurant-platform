package com.restaurant.platform.modules.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    // User info for the frontend
    private String userId;
    private String name;
    private String email;
    private List<String> roles;
}