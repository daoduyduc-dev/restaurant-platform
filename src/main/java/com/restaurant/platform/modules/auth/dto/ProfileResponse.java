package com.restaurant.platform.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private boolean active;
    private List<String> roles;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    private LocalDateTime lastLoginDate;
    
    // Role-specific data
    private Map<String, Object> roleSpecificData;
}
