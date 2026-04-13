package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Expense;
import com.lumberyard_backend.repository.ExpenseRepository;
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
    private ExpenseRepository repository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public List<Expense> getAllExpenses() {
        return repository.findAllByOrderByDateDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> createExpense(@RequestBody Expense expense) {
        // Validation
        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty() ||
            expense.getAmount() == null || expense.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category, Amount and Date are required"));
        }

        return ResponseEntity.ok(repository.save(expense));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        Expense expense = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Validation
        if (expenseDetails.getCategory() == null || expenseDetails.getCategory().trim().isEmpty() ||
            expenseDetails.getAmount() == null || expenseDetails.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category, Amount and Date are required"));
        }

        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setDescription(expenseDetails.getDescription());

        return ResponseEntity.ok(repository.save(expense));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        Expense expense = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        repository.delete(expense);
        return ResponseEntity.ok(Map.of("message", "Expense record deleted successfully"));
    }

    @GetMapping("/total")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getTotalExpenses() {
        Double total = repository.getTotalExpenses();
        return ResponseEntity.ok(Map.of("totalExpenses", total != null ? total : 0.0));
    }
}
