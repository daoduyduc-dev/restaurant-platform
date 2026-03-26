package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.AuthRequest;
import com.restaurant.platform.modules.auth.dto.AuthResponse;

public interface AuthService {

    AuthResponse login(AuthRequest request);
}