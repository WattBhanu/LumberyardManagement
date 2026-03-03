package com.lumberyard_backend.model;

import lombok.Data;

@Data
public class AuthRequest {
    private String username; // Can be email, username, or phone
    private String password;
}