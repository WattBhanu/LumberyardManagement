package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ConsolidatedSalarySummary;
import com.lumberyard_backend.service.DailySalaryReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@CrossOrigin(origins = "*")
public class SalaryHistoryController {

    @Autowired
    private DailySalaryReportService dailySalaryReportService;

    @GetMapping("/report-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    public ResponseEntity<?> getSalaryReportHistory(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            if (start.isAfter(end)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start date must be before or equal to end date"));
            }

            List<ConsolidatedSalarySummary> reports = dailySalaryReportService.getReportsBetweenDates(start, end);

            if (reports.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "No report data available for selected period"
                ));
            }

            double totalWorkerCost = reports.stream()
                .mapToDouble(r -> r.getWorkerTotalCost() != null ? r.getWorkerTotalCost().doubleValue() : 0)
                .sum();
            double totalManagerCost = reports.stream()
                .mapToDouble(r -> r.getManagerTotalCost() != null ? r.getManagerTotalCost().doubleValue() : 0)
                .sum();
            double grandTotal = totalWorkerCost + totalManagerCost;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reports", reports);
            response.put("totalWorkerCost", totalWorkerCost);
            response.put("totalManagerCost", totalManagerCost);
            response.put("grandTotal", grandTotal);
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            response.put("totalDays", reports.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
