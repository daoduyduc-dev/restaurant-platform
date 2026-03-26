package com.restaurant.platform.modules.auth.repository;

import com.restaurant.platform.modules.auth.entity.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    @Query("""
        select u from User u
        where u.email = :email
    """)
    Optional<User> findWithRolesAndPermissions(@Param("email") String email);

    Optional<User> findByName(String name);
}