package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.FinancialTransaction;
import com.lumberyard_backend.repository.FinancialTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Single Responsibility Principle (SRP): This service class is responsible only for 
 * financial transaction business logic and report generation.
 * 
 * Dependency Injection (DIP): It depends on abstraction (Repository) rather than 
 * concrete implementation, which is injected via Spring's @Autowired.
 */
@Service
public class FinancialTransactionService {

    @Autowired
    private FinancialTransactionRepository repository;

    public List<FinancialTransaction> getAllTransactions() {
        return repository.findAllByOrderByDateDesc();
    }

    public FinancialTransaction saveTransaction(FinancialTransaction transaction) {
        return repository.save(transaction);
    }

    public FinancialTransaction updateTransaction(Long id, FinancialTransaction transactionDetails) {
        FinancialTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setType(transactionDetails.getType());
        transaction.setProduct(transactionDetails.getProduct());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setQuantity(transactionDetails.getQuantity());
        transaction.setDate(transactionDetails.getDate());
        transaction.setDescription(transactionDetails.getDescription());

        return repository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        FinancialTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        repository.delete(transaction);
    }

    public Double getTotalRevenue() {
        Double total = repository.getTotalRevenue();
        return total != null ? total : 0.0;
    }

    /**
     * Open/Closed Principle (OCP): This method is designed to generate reports based on 
     * criteria. It can be extended with new filters or report types without modifying 
     * its core logic of fetching and validating data.
     */
    public Map<String, Object> generateReport(LocalDate startDate, LocalDate endDate, String type) {
        List<FinancialTransaction> transactions;
        
        if (startDate != null && endDate != null) {
            if (type != null && !type.isEmpty() && !"ALL".equalsIgnoreCase(type)) {
                transactions = repository.findByDateBetweenAndTypeOrderByDateDesc(startDate, endDate, type);
            } else {
                transactions = repository.findByDateBetweenOrderByDateDesc(startDate, endDate);
            }
        } else {
            transactions = repository.findAllByOrderByDateDesc();
        }

        Map<String, Object> reportData = new HashMap<>();
        
        if (transactions.isEmpty()) {
            reportData.put("success", false);
            reportData.put("message", "No sales data available to generate report");
            return reportData;
        }

        double totalAmount = transactions.stream()
                .mapToDouble(FinancialTransaction::getAmount)
                .sum();

        reportData.put("success", true);
        reportData.put("transactions", transactions);
        reportData.put("totalAmount", totalAmount);
        reportData.put("count", transactions.size());
        reportData.put("startDate", startDate);
        reportData.put("endDate", endDate);
        reportData.put("reportType", type != null ? type : "ALL");

        return reportData;
    }
}
