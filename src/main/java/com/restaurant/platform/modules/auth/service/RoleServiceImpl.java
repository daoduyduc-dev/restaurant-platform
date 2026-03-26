package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.modules.auth.dto.RoleCreateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;
import com.restaurant.platform.modules.auth.mapper.RoleMapper;
import com.restaurant.platform.modules.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public Role createRole(RoleCreateRequest request) {

        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    "Role name is required"
            );
        }

        RoleName roleName;

        try {
            roleName = RoleName.valueOf(
                    request.getName().trim().toUpperCase()
            );
        } catch (Exception e) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    "Invalid role name"
            );
        }

        if (roleRepository.existsByName(roleName)) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    "Role already exists: " + roleName
            );
        }

        Role role = new Role();
        role.setName(roleName);

        return roleRepository.save(role);
    }

    @Override
    @Transactional(readOnly = true)
    public Role getRoleByName(RoleName name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ROLE_NOT_FOUND,
                        "Role not found: " + name
                ));
    }
}