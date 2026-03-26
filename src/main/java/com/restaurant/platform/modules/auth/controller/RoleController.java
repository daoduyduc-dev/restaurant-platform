package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.dto.RoleCreateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;
import com.restaurant.platform.modules.auth.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Role> createRole(
            @RequestBody @Valid RoleCreateRequest request
    ) {
        return ApiResponse.success(roleService.createRole(request));
    }

    @GetMapping("/{name}")
    public ApiResponse<Role> getRoleByName(@PathVariable RoleName name) {
        return ApiResponse.success(
                roleService.getRoleByName(name)
        );
    }
}