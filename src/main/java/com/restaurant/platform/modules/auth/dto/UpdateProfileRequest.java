package com.restaurant.platform.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;
    
    @Size(max = 20, message = "Phone must be less than 20 characters")
    private String phone;
    
    private String address;
    
    private String avatarUrl;
}
