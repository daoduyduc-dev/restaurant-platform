package com.restaurant.platform.modules.auth.mapper;

import com.restaurant.platform.modules.auth.dto.UserCreateRequest;
import com.restaurant.platform.modules.auth.dto.UserResponse;
import com.restaurant.platform.modules.auth.dto.UserUpdateRequest;
import com.restaurant.platform.modules.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public User toEntity(UserCreateRequest request) {
        if (request == null) {
            return null;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        return user;
    }

    public void updateEntity(User user, UserUpdateRequest request) {
        if (user == null || request == null) {
            return;
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
    }

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setActive(user.isActive());

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
