package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "finance_managers")
public class FinanceManager extends User {
    // Finance Manager-specific fields can be added here if needed
    // For now, it inherits all fields from User
}