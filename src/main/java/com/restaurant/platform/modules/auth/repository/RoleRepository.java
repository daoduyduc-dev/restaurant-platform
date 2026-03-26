package com.restaurant.platform.modules.auth.repository;

import com.restaurant.platform.modules.auth.entity.Role;
import com.restaurant.platform.modules.auth.entity.RoleName;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);

    @EntityGraph(attributePaths = {"permissions"})
    @Query("""
        select r from Role r
        where r.name = :name
    """)
    Optional<Role> findWithPermissions(@Param("name") RoleName name);
}