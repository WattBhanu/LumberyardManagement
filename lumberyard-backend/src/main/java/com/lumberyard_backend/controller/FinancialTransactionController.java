package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.FinancialTransaction;
import com.lumberyard_backend.repository.FinancialTransactionRepository;
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
    private FinancialTransactionRepository repository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public List<FinancialTransaction> getAllTransactions() {
        return repository.findAllByOrderByDateDesc();
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

        return ResponseEntity.ok(repository.save(transaction));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody FinancialTransaction transactionDetails) {
        FinancialTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setType(transactionDetails.getType());
        transaction.setProduct(transactionDetails.getProduct());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setQuantity(transactionDetails.getQuantity());
        transaction.setDate(transactionDetails.getDate());
        transaction.setDescription(transactionDetails.getDescription());

        // Validation
        if (transaction.getType() == null || transaction.getAmount() == null || transaction.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Type, Amount and Date are required"));
        }

        if ("SALE".equalsIgnoreCase(transaction.getType())) {
            if (transaction.getProduct() == null || transaction.getQuantity() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product and Quantity are required for sales"));
            }
        }

        return ResponseEntity.ok(repository.save(transaction));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        FinancialTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        repository.delete(transaction);
        return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getSummary() {
        Double totalRevenue = repository.getTotalRevenue();
        return ResponseEntity.ok(Map.of("totalRevenue", totalRevenue != null ? totalRevenue : 0.0));
    }
}
