package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ConsolidatedSalarySummary;
import com.lumberyard_backend.dto.ManagerAttendanceDTO;
import com.lumberyard_backend.service.DailySalaryReportService;
import com.lumberyard_backend.service.ManagerAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary-reports")
@CrossOrigin(origins = "*")
public class SalaryReportController {
    
    @Autowired
    private ManagerAttendanceService managerAttendanceService;
    
    @Autowired
    private DailySalaryReportService dailySalaryReportService;
    
    // ========== MANAGER ATTENDANCE ENDPOINTS ==========
    
    // Get all managers for attendance marking
    @GetMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllManagersForAttendance() {
        try {
            List<ManagerAttendanceDTO> managers = managerAttendanceService.getAllManagersForAttendance();
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get attendance for a specific date
    @GetMapping("/attendance/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAttendanceForDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<ManagerAttendanceDTO> attendance = managerAttendanceService.getAttendanceForDate(date);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Mark attendance for managers
    @PostMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markAttendance(@RequestBody MarkAttendanceRequest request) {
        try {
            if (request.getAttendanceList() == null || request.getAttendanceList().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Attendance list cannot be empty"));
            }
            
            List<ManagerAttendanceDTO> savedRecords = managerAttendanceService.markAttendance(
                request.getAttendanceList(),
                request.getDate(),
                request.getMarkedBy()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Attendance marked successfully",
                "count", savedRecords.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========== SALARY REPORT ENDPOINTS ==========
    
    // Generate daily salary report
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateDailyReport(@RequestBody GenerateReportRequest request) {
        try {
            ConsolidatedSalarySummary summary = dailySalaryReportService.generateDailyReport(
                request.getReportDate(),
                request.getGeneratedBy()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Report generated successfully",
                "summary", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get report by date
    @GetMapping("/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            ConsolidatedSalarySummary summary = dailySalaryReportService.getReportByDate(date);
            
            if (summary == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No report found for date: " + date));
            }
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get report history
    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportHistory() {
        try {
            List<ConsolidatedSalarySummary> history = dailySalaryReportService.getReportHistoryWithSummaries();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Generate salary report for date range
    @GetMapping("/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateSalaryReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<ConsolidatedSalarySummary> reports = dailySalaryReportService.getReportsBetweenDates(start, end);
            
            if (reports.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "No salary data available for the selected date range"
                ));
            }
            
            double totalWorkerCost = reports.stream()
                .mapToDouble(r -> r.getWorkerTotalCost() != null ? r.getWorkerTotalCost().doubleValue() : 0)
                .sum();
            double totalManagerCost = reports.stream()
                .mapToDouble(r -> r.getManagerTotalCost() != null ? r.getManagerTotalCost().doubleValue() : 0)
                .sum();
            double grandTotal = totalWorkerCost + totalManagerCost;
            
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("success", true);
            reportData.put("reports", reports);
            reportData.put("totalWorkerCost", totalWorkerCost);
            reportData.put("totalManagerCost", totalManagerCost);
            reportData.put("grandTotal", grandTotal);
            reportData.put("startDate", startDate);
            reportData.put("endDate", endDate);
            reportData.put("totalDays", reports.size());
            
            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========== REQUEST DTOs ==========
    
    public static class MarkAttendanceRequest {
        private List<ManagerAttendanceDTO> attendanceList;
        private LocalDate date;
        private String markedBy;
        
        public List<ManagerAttendanceDTO> getAttendanceList() { return attendanceList; }
        public void setAttendanceList(List<ManagerAttendanceDTO> attendanceList) { this.attendanceList = attendanceList; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public String getMarkedBy() { return markedBy; }
        public void setMarkedBy(String markedBy) { this.markedBy = markedBy; }
    }
    
    public static class GenerateReportRequest {
        private LocalDate reportDate;
        private String generatedBy;
        
        public LocalDate getReportDate() { return reportDate; }
        public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
        public String getGeneratedBy() { return generatedBy; }
        public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
    }
}
