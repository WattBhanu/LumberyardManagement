package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Expense;
import com.lumberyard_backend.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public List<Expense> getAllExpenses() {
        return service.getAllExpenses();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> createExpense(@RequestBody Expense expense) {
        // Validation
        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty() ||
            expense.getAmount() == null || expense.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category, Amount and Date are required"));
        }

        return ResponseEntity.ok(service.saveExpense(expense));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        try {
            return ResponseEntity.ok(service.updateExpense(id, expenseDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        try {
            service.deleteExpense(id);
            return ResponseEntity.ok(Map.of("message", "Expense record deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/total")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getTotalExpenses() {
        return ResponseEntity.ok(Map.of("totalExpenses", service.getTotalExpenses()));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category) {
        
        java.time.LocalDate start = startDate != null ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = endDate != null ? java.time.LocalDate.parse(endDate) : null;
        
        Map<String, Object> report = service.generateReport(start, end, category);
        
        return ResponseEntity.ok(report);
    }
}
