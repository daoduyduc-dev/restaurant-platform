package com.restaurant.platform.modules.auth.service;

import com.restaurant.platform.modules.auth.dto.RoleCreateRequest;
import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;

public interface RoleService {

    Role createRole(RoleCreateRequest request);

    Role getRoleByName(RoleName name);
}