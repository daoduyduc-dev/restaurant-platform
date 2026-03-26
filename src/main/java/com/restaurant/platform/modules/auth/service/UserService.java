package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;

import java.util.UUID;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(UUID userId, UserUpdateRequest request);

    void deleteUser(UUID userId);

    UserResponse getUserByName(String name);
}