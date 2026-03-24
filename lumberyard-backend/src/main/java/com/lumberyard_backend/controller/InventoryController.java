package com.lumberyard_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok("Inventory Dashboard Data");
    }
}