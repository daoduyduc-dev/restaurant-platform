package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

public interface AuthService {

    AuthResponse login(AuthRequest request);

    AuthResponse refresh(String token);

    void logout(HttpServletRequest request);

    void changePassword(@Valid ChangePasswordRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}