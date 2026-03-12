package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin extends User {
    // Admin-specific fields can be added here if needed
    // For now, it inherits all fields from User
}