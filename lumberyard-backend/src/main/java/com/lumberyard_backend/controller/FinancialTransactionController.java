package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.FinancialTransaction;
import com.lumberyard_backend.service.FinancialTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/transactions")
@CrossOrigin(origins = "*")
public class FinancialTransactionController {

    @Autowired
    private FinancialTransactionService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public List<FinancialTransaction> getAllTransactions() {
        return service.getAllTransactions();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> createTransaction(@RequestBody FinancialTransaction transaction) {
        // Validation
        if (transaction.getType() == null || transaction.getAmount() == null || transaction.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Type, Amount and Date are required"));
        }

        if ("SALE".equalsIgnoreCase(transaction.getType())) {
            if (transaction.getProduct() == null || transaction.getQuantity() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product and Quantity are required for sales"));
            }
        }

        return ResponseEntity.ok(service.saveTransaction(transaction));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody FinancialTransaction transactionDetails) {
        try {
            return ResponseEntity.ok(service.updateTransaction(id, transactionDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            service.deleteTransaction(id);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(Map.of("totalRevenue", service.getTotalRevenue()));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String type) {
        
        java.time.LocalDate start = startDate != null ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = endDate != null ? java.time.LocalDate.parse(endDate) : null;
        
        Map<String, Object> report = service.generateReport(start, end, type);
        
        if (Boolean.FALSE.equals(report.get("success"))) {
            return ResponseEntity.ok(report);
        }
        
        return ResponseEntity.ok(report);
    }
}
