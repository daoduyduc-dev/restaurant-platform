package com.restaurant.platform.modules.auth.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private boolean active;
    @Builder.Default
    private List<String> roles = new ArrayList<>();

    // Setter that accepts both Set<String> and List<String>
    public void setRoles(Collection<String> roles) {
        this.roles = roles != null ? new ArrayList<>(roles) : new ArrayList<>();
    }
}