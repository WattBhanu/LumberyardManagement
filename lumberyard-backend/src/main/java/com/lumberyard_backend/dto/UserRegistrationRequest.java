package com.lumberyard_backend.dto;

import com.lumberyard_backend.entity.Role;
import lombok.Data;

@Data
public class UserRegistrationRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Role role;
    private Double dailySalaryRate;
}
