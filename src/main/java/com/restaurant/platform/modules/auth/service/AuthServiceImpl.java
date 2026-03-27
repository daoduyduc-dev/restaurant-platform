package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.*;
import com.restaurant.platform.modules.auth.entity.BlacklistedToken;
import com.restaurant.platform.modules.auth.entity.PasswordResetToken;
import com.restaurant.platform.modules.auth.entity.RefreshToken;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.BlacklistRepository;
import com.restaurant.platform.modules.auth.repository.PasswordResetRepository;
import com.restaurant.platform.modules.auth.repository.RefreshTokenRepository;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.security.JwtService;
import com.restaurant.platform.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshRepo;
    private final BlacklistRepository blacklistRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetRepository resetRepo;

    @Override
    public AuthResponse login(AuthRequest request) {

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails user = (UserDetails) auth.getPrincipal();

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken = createRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public AuthResponse refresh(String token) {

        RefreshToken rt = refreshRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid"));

        if (rt.isRevoked() || rt.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Expired");
        }

        String newAccess = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        rt.getUsername(), "", List.of()
                )
        );

        return AuthResponse.builder()
                .accessToken(newAccess)
                .refreshToken(token)
                .build();
    }

    @Override
    public void logout(HttpServletRequest request) {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return;
        }

        String token = header.substring(7);

        BlacklistedToken blacklisted = new BlacklistedToken();
        blacklisted.setToken(token);
        blacklisted.setExpiryDate(
                jwtService.extractExpiry(token).toInstant()
        );

        blacklistRepository.save(blacklisted);
    }

    private RefreshToken createRefreshToken(String username) {

        RefreshToken token = new RefreshToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUsername(username);
        token.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));
        token.setRevoked(false);

        return refreshRepo.save(token);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {

        String username = SecurityUtils.getCurrentUsername();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password incorrect");
        }

        // set new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        PasswordResetToken reset = new PasswordResetToken();
        reset.setToken(token);
        reset.setEmail(user.getEmail());
        reset.setExpiryDate(Instant.now().plus(15, ChronoUnit.MINUTES));
        reset.setUsed(false);

        resetRepo.save(reset);

        // TODO: gửi email
        System.out.println("Reset link: http://localhost:3000/reset?token=" + token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        PasswordResetToken token = resetRepo.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.isUsed() || token.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = userRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        token.setUsed(true);
    }
}