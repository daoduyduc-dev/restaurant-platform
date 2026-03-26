package com.restaurant.platform.modules.auth.mapper;

import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    // 👉 CREATE
    public User toEntity(UserCreateRequest request) {
        if (request == null) return null;

        User user = new User();

        user.setName(request.getName());      // 🔥 quan trọng (bạn đang dùng name)
        user.setEmail(request.getEmail());

        // ❗ password sẽ encode ở service → không set ở đây
        // ❗ roles sẽ set ở service

        return user;
    }

    // 👉 UPDATE
    public void updateEntity(User user, UserUpdateRequest request) {
        if (user == null || request == null) return;

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        // ❗ password update riêng (nếu có)
        // ❗ roles update riêng
    }

    // 👉 RESPONSE
    public UserResponse toResponse(User user) {
        if (user == null) return null;

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());

        // map roles
        if (user.getRoles() != null) {
            Set<String> roles = user.getRoles()
                    .stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toSet());

            response.setRoles(roles);
        }

        return response;
    }
}