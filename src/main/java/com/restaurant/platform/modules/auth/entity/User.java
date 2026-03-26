package com.restaurant.platform.modules.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.restaurant.platform.common.base.SoftDeleteEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@SuperBuilder
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_email", columnNames = "email")
        }
)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class User extends SoftDeleteEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Email
    @Column(nullable = false, length = 100)
    private String email;

    private String phone;

    private String address;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
}