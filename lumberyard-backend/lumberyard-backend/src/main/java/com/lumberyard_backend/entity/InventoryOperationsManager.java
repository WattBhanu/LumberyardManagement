package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_operations_managers")
public class InventoryOperationsManager extends User {
    // Inventory Operations Manager-specific fields can be added here if needed
    // For now, it inherits all fields from User
}