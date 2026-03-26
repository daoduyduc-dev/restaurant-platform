package com.restaurant.platform.modules.auth.mapper;

import com.restaurant.platform.modules.auth.dto.RoleCreateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public Role toEntity(RoleCreateRequest request) {
        Role role = new Role();
        return role;
    }
}