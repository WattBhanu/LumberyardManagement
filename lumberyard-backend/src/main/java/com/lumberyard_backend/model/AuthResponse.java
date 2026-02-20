package com.lumberyard_backend.model;

import com.lumberyard_backend.entity.Role;
import lombok.Data;

@Data
public class AuthResponse {
    private String jwt;
    private String username;
    private String name;
    private Role role;
    private String message;

    public AuthResponse(String jwt, String username, String name, Role role, String message) {
        this.jwt = jwt;
        this.username = username;
        this.name = name;
        this.role = role;
        this.message = message;
    }
}