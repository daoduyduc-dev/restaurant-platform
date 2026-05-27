package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.*;
import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.modules.auth.entity.BlacklistedToken;
import com.restaurant.platform.modules.auth.entity.PasswordResetToken;
import com.restaurant.platform.modules.auth.entity.RefreshToken;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.BlacklistRepository;
import com.restaurant.platform.modules.auth.repository.PasswordResetRepository;
import com.restaurant.platform.modules.auth.repository.RefreshTokenRepository;
import com.restaurant.platform.modules.auth.repository.RoleRepository;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.exception.UnauthorizedException;
import com.restaurant.platform.common.EmailService;
import com.restaurant.platform.security.JwtService;
import com.restaurant.platform.security.SecurityUtils;
import com.restaurant.platform.security.UserDetailsServiceImpl;
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
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetRepository resetRepo;
    private final EmailService emailService;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    ErrorCode.USER_ALREADY_EXISTS,
                    "Email already exists: " + request.getEmail()
            );
        }

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ROLE_NOT_FOUND,
                        "Customer role not found"
                ));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .roles(java.util.Set.of(customerRole))
                .build();

        userRepository.save(user);
        return login(toAuthRequest(request));
    }

    private AuthRequest toAuthRequest(RegisterRequest request) {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail(request.getEmail());
        authRequest.setPassword(request.getPassword());
        return authRequest;
    }

    @Override
    public AuthResponse login(AuthRequest request) {

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();

        String accessToken = jwtService.generateToken(userDetails);

        RefreshToken refreshToken = createRefreshToken(userDetails.getUsername());

        // Fetch full user for response
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));


        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .build();
    }

    @Override
    public AuthResponse refresh(String token) {

        RefreshToken rt = refreshRepo.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("INVALID_TOKEN", "Invalid refresh token"));

        if (rt.isRevoked() || rt.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("TOKEN_EXPIRED", "Refresh token has expired");
        }

        // Load full user with roles and permissions
        UserDetails userDetails = userDetailsService.loadUserByUsername(rt.getUsername());

        String newAccess = jwtService.generateToken(userDetails);

        // Fetch full user for response
        User user = userRepository.findByEmail(rt.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        return AuthResponse.builder()
                .accessToken(newAccess)
                .refreshToken(token)
                .userId(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .build();
    }

    @Override
    public void logout(HttpServletRequest request) {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String accessToken = header.substring(7);

            BlacklistedToken blacklisted = new BlacklistedToken();
            blacklisted.setToken(accessToken);
            blacklisted.setExpiryDate(
                    jwtService.extractExpiry(accessToken).toInstant()
            );

            blacklistRepository.save(blacklisted);
        }

        String refreshToken = request.getHeader("X-Refresh-Token");

        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshRepo.findByToken(refreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshRepo.save(token);
            });
        }
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
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("INVALID_PASSWORD", "Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        String token = UUID.randomUUID().toString();

        PasswordResetToken reset = new PasswordResetToken();
        reset.setToken(token);
        reset.setEmail(user.getEmail());
        reset.setExpiryDate(Instant.now().plus(15, ChronoUnit.MINUTES));
        reset.setUsed(false);

        resetRepo.save(reset);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        PasswordResetToken token = resetRepo.findByToken(request.getToken())
                .orElseThrow(() -> new UnauthorizedException("INVALID_TOKEN", "Invalid reset token"));

        if (token.isUsed() || token.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("TOKEN_EXPIRED", "Password reset token has expired");
        }

        User user = userRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        token.setUsed(true);
    }
}
