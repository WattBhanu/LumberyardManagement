package com.lumberyard_backend.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lumberyard_backend.service.ProfitLossReportService;

/**
 * ProfitLossReportController - REST API endpoints for profit & loss reporting
 * 
 * SRP (Single Responsibility Principle):
 * This controller ONLY handles HTTP requests/responses for profit/loss reports.
 * Business logic is delegated to ProfitLossReportService.
 * 
 * DIP (Dependency Injection Principle):
 * Depends on ProfitLossReportService abstraction, injected via @Autowired.
 * 
 * MVC Architecture:
 * Controller layer - handles request mapping and response formatting
 * Service layer - handles business logic (see ProfitLossReportService)
 * Repository layer - handles data access (see FinancialTransactionRepository, ExpenseRepository)
 */
@RestController
@RequestMapping("/api/finance/profit-loss-report")
@CrossOrigin(origins = "*")
public class ProfitLossReportController {

    @Autowired
    private ProfitLossReportService profitLossReportService;

    /**
     * GET /api/finance/profit-loss-report
     * 
     * Generates a detailed profit & loss report with daily breakdown
     * 
     * @param startDate Optional start date (defaults to current month start if not provided)
     * @param endDate Optional end date (defaults to current date if not provided)
     * @return ResponseEntity with report data including daily breakdown
     * 
     * Acceptance Criteria:
     * - Scenario 1: If data exists → Show calculated profit/loss with daily breakdown
     * - Scenario 2: If no data → Display "No profit/loss data available to generate report"
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getProfitLossReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            // Set default dates if not provided
            if (startDate == null) {
                startDate = LocalDate.now().withDayOfMonth(1); // Start of current month
            }
            if (endDate == null) {
                endDate = LocalDate.now(); // Current date
            }

            Map<String, Object> report = profitLossReportService.generateProfitLossReport(startDate, endDate);
            
            if (Boolean.FALSE.equals(report.get("success"))) {
                return ResponseEntity.ok(report);
            }

            return ResponseEntity.ok(report);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to generate profit/loss report: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/finance/profit-loss-report/summary
     * 
     * Generates a summary profit & loss report (aggregated totals only)
     * 
     * @param startDate Optional start date
     * @param endDate Optional end date
     * @return ResponseEntity with summary report data
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getProfitLossSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            // Set default dates if not provided
            if (startDate == null) {
                startDate = LocalDate.now().withDayOfMonth(1);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            Map<String, Object> report = profitLossReportService.generateSummaryReport(startDate, endDate);
            
            if (Boolean.FALSE.equals(report.get("success"))) {
                return ResponseEntity.ok(report);
            }

            return ResponseEntity.ok(report);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to generate summary report: " + e.getMessage()
            ));
        }
    }
}
