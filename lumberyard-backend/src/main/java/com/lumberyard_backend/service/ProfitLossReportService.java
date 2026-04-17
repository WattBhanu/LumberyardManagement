package com.lumberyard_backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lumberyard_backend.dto.ProfitLossReportDTO;
import com.lumberyard_backend.entity.Expense;
import com.lumberyard_backend.entity.FinancialTransaction;
import com.lumberyard_backend.repository.DailySalaryReportRepository;
import com.lumberyard_backend.repository.ExpenseRepository;
import com.lumberyard_backend.repository.FinancialTransactionRepository;

/**
 * ProfitLossReportService - Handles all profit & loss reporting business logic
 * 
 * SRP (Single Responsibility Principle): 
 * This service is ONLY responsible for profit/loss calculation and report generation.
 * It does not handle data persistence or user authentication.
 * 
 * DIP (Dependency Injection Principle):
 * Depends on repository abstractions (FinancialTransactionRepository, ExpenseRepository)
 * rather than concrete implementations, injected via Spring's @Autowired.
 * 
 * OCP (Open/Closed Principle):
 * Designed to be extended for monthly/yearly reports or additional financial metrics
 * without modifying the core calculation logic.
 */
@Service
public class ProfitLossReportService {

    @Autowired
    private FinancialTransactionRepository transactionRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DailySalaryReportRepository salaryReportRepository;

    @Autowired
    private DailySalaryReportService salaryReportService;

    /**
     * Generates a comprehensive profit & loss report for a date range
     * 
     * @param startDate Start date of the report period
     * @param endDate End date of the report period
     * @return Map containing report data and metadata
     */
    public Map<String, Object> generateProfitLossReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();

        try {
            // Validate date range
            if (startDate == null || endDate == null) {
                report.put("success", false);
                report.put("message", "Start date and end date are required");
                return report;
            }

            if (startDate.isAfter(endDate)) {
                report.put("success", false);
                report.put("message", "Start date cannot be after end date");
                return report;
            }

            // Fetch all data for the date range
            List<FinancialTransaction> transactions = transactionRepository
                    .findByDateBetweenOrderByDateDesc(startDate, endDate);
            
            List<Expense> expenses = expenseRepository
                    .findByDateBetweenOrderByDateDesc(startDate, endDate);

            // Group transactions and expenses by date
            Map<LocalDate, Double> incomeByDate = transactions.stream()
                    .collect(Collectors.groupingBy(
                            FinancialTransaction::getDate,
                            Collectors.summingDouble(FinancialTransaction::getAmount)
                    ));

            Map<LocalDate, Double> expensesByDate = expenses.stream()
                    .collect(Collectors.groupingBy(
                            Expense::getDate,
                            Collectors.summingDouble(Expense::getAmount)
                    ));

            // Fetch salary reports for the date range
            List<com.lumberyard_backend.entity.DailySalaryReport> salaryReports = salaryReportRepository
                    .findByReportDateBetweenOrderByReportDateDesc(startDate, endDate);
            
            // Group salary by date
            Map<LocalDate, Double> salaryByDate = salaryReports.stream()
                    .collect(Collectors.groupingBy(
                            com.lumberyard_backend.entity.DailySalaryReport::getReportDate,
                            Collectors.summingDouble(r -> r.getTotalSalary() != null ? r.getTotalSalary().doubleValue() : 0.0)
                    ));

            // Get all unique dates in the range
            Set<LocalDate> allDates = new HashSet<>();
            allDates.addAll(incomeByDate.keySet());
            allDates.addAll(expensesByDate.keySet());
            allDates.addAll(salaryByDate.keySet());

            // If no data exists, return appropriate message
            if (allDates.isEmpty()) {
                report.put("success", false);
                report.put("message", "No profit/loss data available to generate report");
                report.put("startDate", startDate);
                report.put("endDate", endDate);
                return report;
            }

            // Generate daily report entries
            List<ProfitLossReportDTO> dailyReports = new ArrayList<>();
            double grandTotalIncome = 0.0;
            double grandTotalExpenses = 0.0;
            double grandTotalSalary = 0.0;

            // Sort dates chronologically
            List<LocalDate> sortedDates = allDates.stream()
                    .sorted()
                    .collect(Collectors.toList());

            for (LocalDate date : sortedDates) {
                double dailyIncome = incomeByDate.getOrDefault(date, 0.0);
                double dailyExpenses = expensesByDate.getOrDefault(date, 0.0);
                double dailySalary = salaryByDate.getOrDefault(date, 0.0);

                ProfitLossReportDTO dailyReport = new ProfitLossReportDTO(
                        date, 
                        dailyIncome, 
                        dailyExpenses, 
                        dailySalary
                );
                
                dailyReports.add(dailyReport);

                // Accumulate totals
                grandTotalIncome += dailyIncome;
                grandTotalExpenses += dailyExpenses;
                grandTotalSalary += dailySalary;
            }

            // Calculate overall net
            double grandNet = grandTotalIncome - (grandTotalExpenses + grandTotalSalary);
            String overallStatus = calculateStatus(grandNet);

            // Build response
            report.put("success", true);
            report.put("startDate", startDate);
            report.put("endDate", endDate);
            report.put("totalIncome", grandTotalIncome);
            report.put("totalExpenses", grandTotalExpenses);
            report.put("totalSalary", grandTotalSalary);
            report.put("net", grandNet);
            report.put("status", overallStatus);
            report.put("dailyReports", dailyReports);
            report.put("recordCount", dailyReports.size());

            return report;

        } catch (Exception e) {
            report.put("success", false);
            report.put("message", "Error generating profit/loss report: " + e.getMessage());
            return report;
        }
    }

    /**
     * Generates a summary profit & loss report (single aggregated record)
     * 
     * @param startDate Start date of the report period
     * @param endDate End date of the report period
     * @return Map containing summary report data
     */
    public Map<String, Object> generateSummaryReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();

        try {
            // Validate date range
            if (startDate == null || endDate == null) {
                report.put("success", false);
                report.put("message", "Start date and end date are required");
                return report;
            }

            if (startDate.isAfter(endDate)) {
                report.put("success", false);
                report.put("message", "Start date cannot be after end date");
                return report;
            }

            // Fetch aggregated data
            List<FinancialTransaction> transactions = transactionRepository
                    .findByDateBetweenOrderByDateDesc(startDate, endDate);
            
            List<Expense> expenses = expenseRepository
                    .findByDateBetweenOrderByDateDesc(startDate, endDate);

            double totalIncome = transactions.stream()
                    .mapToDouble(FinancialTransaction::getAmount)
                    .sum();

            double totalExpenses = expenses.stream()
                    .mapToDouble(Expense::getAmount)
                    .sum();

            // Fetch salary data for the date range
            List<com.lumberyard_backend.entity.DailySalaryReport> salaryReports = salaryReportRepository
                    .findByReportDateBetweenOrderByReportDateDesc(startDate, endDate);
            
            double totalSalary = salaryReports.stream()
                    .mapToDouble(r -> r.getTotalSalary() != null ? r.getTotalSalary().doubleValue() : 0.0)
                    .sum();

            double net = totalIncome - (totalExpenses + totalSalary);
            String status = calculateStatus(net);

            // Check if data exists
            if (transactions.isEmpty() && expenses.isEmpty()) {
                report.put("success", false);
                report.put("message", "No profit/loss data available to generate report");
                report.put("startDate", startDate);
                report.put("endDate", endDate);
                return report;
            }

            // Build response
            report.put("success", true);
            report.put("startDate", startDate);
            report.put("endDate", endDate);
            report.put("totalIncome", totalIncome);
            report.put("totalExpenses", totalExpenses);
            report.put("totalSalary", totalSalary);
            report.put("net", net);
            report.put("status", status);
            report.put("transactionCount", transactions.size());
            report.put("expenseCount", expenses.size());

            return report;

        } catch (Exception e) {
            report.put("success", false);
            report.put("message", "Error generating summary report: " + e.getMessage());
            return report;
        }
    }

    /**
     * Helper method to calculate profit/loss status
     * 
     * @param net Net profit/loss value
     * @return Status string: "Profit", "Loss", or "Break-even"
     */
    private String calculateStatus(double net) {
        if (net > 0) {
            return "Profit";
        } else if (net < 0) {
            return "Loss";
        } else {
            return "Break-even";
        }
    }
}
