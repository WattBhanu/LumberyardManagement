package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ManagerSalaryResponse;
import com.lumberyard_backend.dto.ManagerSalaryUpdateRequest;
import com.lumberyard_backend.service.ManagerSalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salaries/managers")
@CrossOrigin(origins = "*")
public class ManagerSalaryController {
    
    @Autowired
    private ManagerSalaryService managerSalaryService;
    
    // Get all managers with their current salary
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ManagerSalaryResponse>> getAllManagersWithSalary() {
        List<ManagerSalaryResponse> responses = managerSalaryService.getAllManagersWithSalary();
        return ResponseEntity.ok(responses);
    }
    
    // Update manager salary
    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateManagerSalary(
            @RequestBody ManagerSalaryUpdateRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String updatedBy) {
        try {
            ManagerSalaryResponse response = managerSalaryService.updateManagerSalary(request, updatedBy);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get salary history for a specific manager
    @GetMapping("/history/{managerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ManagerSalaryResponse>> getManagerSalaryHistory(
            @PathVariable Long managerId) {
        try {
            List<ManagerSalaryResponse> history = managerSalaryService.getManagerSalaryHistory(managerId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
