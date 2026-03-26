package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.modules.auth.dto.AuthRequest;
import com.restaurant.platform.modules.auth.dto.AuthResponse;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(AuthRequest request) {

        // 1. tìm user
        User user = userRepository.findWithRolesAndPermissions(request.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.INVALID_CREDENTIALS,
                        "Invalid email or password"
                ));

        // 2. check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException(
                    ErrorCode.INVALID_CREDENTIALS,
                    "Invalid email or password"
            );
        }

        // 3. generate token
        String token = jwtService.generateToken(user.getEmail());

        // 4. return
        return AuthResponse.builder()
                .token(token)
                .build();
    }
}