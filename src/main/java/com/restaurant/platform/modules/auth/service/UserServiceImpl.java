package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.EmailService;
import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.mapper.UserMapper;
import com.restaurant.platform.modules.auth.repository.RoleRepository;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public UserResponse createUser(UserCreateRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    ErrorCode.USER_ALREADY_EXISTS,
                    "Email already exists: " + request.getEmail()
            );
        }

        User user = userMapper.toEntity(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                ErrorCode.ROLE_NOT_FOUND,
                                "Role not found: " + roleName
                        )))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found: " + userId
                ));

        userMapper.updateEntity(user, request);

        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found: " + userId
                ));

        user.setDeleted(true);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByName(String name) {

        User user = userRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found: " + name
                ));

        return userMapper.toResponse(user);
    }
}