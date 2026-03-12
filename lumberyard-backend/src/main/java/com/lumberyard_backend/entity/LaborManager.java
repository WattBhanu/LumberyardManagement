package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "labor_managers")
public class LaborManager extends User {
    // Labor Manager-specific fields can be added here if needed
    // For now, it inherits all fields from User
}