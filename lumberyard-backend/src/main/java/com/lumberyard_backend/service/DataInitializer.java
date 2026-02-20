package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Role;
import com.lumberyard_backend.entity.User;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    @Autowired
    private UserService userService;

    @PostConstruct
    public void initializeData() {
        // Check if users already exist to avoid duplicates on restart
        if (userService.findByEmail("admin@lumberyard.com").isEmpty()) {
            // Create an admin user
            userService.createUser(
                "Admin User",
                "admin@lumberyard.com",
                "1234567890",
                "admin123", // This will be encoded
                Role.ADMIN
            );
        }

        if (userService.findByEmail("inventory@lumberyard.com").isEmpty()) {
            // Create an inventory operations manager
            userService.createUser(
                "Inventory Manager",
                "inventory@lumberyard.com",
                "1234567891",
                "inv123", // This will be encoded
                Role.INVENTORY_OPERATIONS_MANAGER
            );
        }

        if (userService.findByEmail("labor@lumberyard.com").isEmpty()) {
            // Create a labor manager
            userService.createUser(
                "Labor Manager",
                "labor@lumberyard.com",
                "1234567892",
                "labor123", // This will be encoded
                Role.LABOR_MANAGER
            );
        }

        if (userService.findByEmail("finance@lumberyard.com").isEmpty()) {
            // Create a finance manager
            userService.createUser(
                "Finance Manager",
                "finance@lumberyard.com",
                "1234567893",
                "finance123", // This will be encoded
                Role.FINANCE_MANAGER
            );
        }

        System.out.println("Sample data initialized successfully!");
    }
}