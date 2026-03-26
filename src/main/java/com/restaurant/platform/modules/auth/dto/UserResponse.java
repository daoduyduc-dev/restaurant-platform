package com.restaurant.platform.modules.auth.dto;

import lombok.*;


import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private Set<String> roles;
}