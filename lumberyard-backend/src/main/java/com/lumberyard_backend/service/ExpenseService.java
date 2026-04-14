package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Expense;
import com.lumberyard_backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Single Responsibility Principle (SRP): This service class handles only 
 * expense-related business logic and report generation.
 * 
 * Dependency Injection (DIP): It depends on the ExpenseRepository abstraction.
 */
@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository repository;

    public List<Expense> getAllExpenses() {
        return repository.findAllByOrderByDateDesc();
    }

    public Expense saveExpense(Expense expense) {
        return repository.save(expense);
    }

    public Expense updateExpense(Long id, Expense expenseDetails) {
        Expense expense = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setDescription(expenseDetails.getDescription());

        return repository.save(expense);
    }

    public void deleteExpense(Long id) {
        Expense expense = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        repository.delete(expense);
    }

    public Double getTotalExpenses() {
        Double total = repository.getTotalExpenses();
        return total != null ? total : 0.0;
    }

    /**
     * Open/Closed Principle (OCP): Reporting logic is designed to be extendable 
     * with new filters or export formats without modifying core fetching logic.
     */
    public Map<String, Object> generateReport(LocalDate startDate, LocalDate endDate, String category) {
        List<Expense> expenses;
        
        if (startDate != null && endDate != null) {
            if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
                expenses = repository.findByDateBetweenAndCategoryOrderByDateDesc(startDate, endDate, category);
            } else {
                expenses = repository.findByDateBetweenOrderByDateDesc(startDate, endDate);
            }
        } else {
            expenses = repository.findAllByOrderByDateDesc();
        }

        Map<String, Object> reportData = new HashMap<>();
        
        if (expenses.isEmpty()) {
            reportData.put("success", false);
            reportData.put("message", "No expense data available to generate report");
            return reportData;
        }

        double totalAmount = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        reportData.put("success", true);
        reportData.put("expenses", expenses);
        reportData.put("totalAmount", totalAmount);
        reportData.put("count", expenses.size());
        reportData.put("startDate", startDate);
        reportData.put("endDate", endDate);
        reportData.put("category", category != null ? category : "ALL");

        return reportData;
    }
}
