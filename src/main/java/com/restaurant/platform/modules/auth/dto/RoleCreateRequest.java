package com.restaurant.platform.modules.auth.dto;

import com.restaurant.platform.modules.auth.entity.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleCreateRequest {

    @NotNull(message = "Role name must not be null")
    private String name;
}