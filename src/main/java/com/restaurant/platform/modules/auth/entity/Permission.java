package com.restaurant.platform.modules.auth.entity;

import com.restaurant.platform.common.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "permissions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_permission_code", columnNames = "code")
        }
)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Permission extends AuditableEntity {

    @Column(nullable = false, length = 100)
    private String code;

    @Column(nullable = false, length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PermissionModule module;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
}