package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.ConsolidatedSalarySummary;
import com.lumberyard_backend.dto.DailySalaryReportDTO;
import com.lumberyard_backend.entity.*;
import com.lumberyard_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DailySalaryReportService {
    
    @Autowired
    private DailySalaryReportRepository reportRepository;
    
    @Autowired
    private ManagerAttendanceRepository managerAttendanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Note: You'll need to inject worker attendance/worker repositories here
    // For now, I'm creating a placeholder - we'll integrate with existing worker system
    
    // Generate daily consolidated salary report
    @Transactional
    public ConsolidatedSalarySummary generateDailyReport(LocalDate reportDate, String generatedBy) {
        // Delete existing report for this date if exists (allow regeneration)
        if (reportRepository.existsByReportDate(reportDate)) {
            reportRepository.deleteByReportDate(reportDate);
        }
        
        List<DailySalaryReportDTO> staffDetails = new ArrayList<>();
        
        // 1. Process Managers
        List<ManagerAttendance> managerAttendances = managerAttendanceRepository.findByAttendanceDate(reportDate);
        BigDecimal managerTotalCost = BigDecimal.ZERO;
        int managerCount = 0;
        
        for (ManagerAttendance attendance : managerAttendances) {
            if (Boolean.TRUE.equals(attendance.getIsPresent())) {
                User manager = attendance.getManager();
                BigDecimal dailyRate = manager.getDailySalaryRate() != null ? 
                    BigDecimal.valueOf(manager.getDailySalaryRate()) : BigDecimal.ZERO;
                
                // Create report entry
                DailySalaryReport report = new DailySalaryReport();
                report.setReportDate(reportDate);
                report.setStaffType("MANAGER");
                report.setStaffId(manager.getUserId());
                report.setStaffName(manager.getName());
                report.setPositionRole(manager.getRole().name());
                report.setRateType("DAILY");
                report.setRateAmount(dailyRate);
                report.setHoursOrDays(BigDecimal.ONE); // 1 day
                report.setTotalSalary(dailyRate);
                report.setIsPresent(true);
                report.setGeneratedBy(generatedBy);
                
                reportRepository.save(report);
                
                // Add to DTO list
                DailySalaryReportDTO dto = new DailySalaryReportDTO();
                dto.setStaffId(manager.getUserId());
                dto.setStaffName(manager.getName());
                dto.setStaffType("MANAGER");
                dto.setPositionRole(manager.getRole().name());
                dto.setRateType("DAILY");
                dto.setRateAmount(dailyRate);
                dto.setHoursOrDays(BigDecimal.ONE);
                dto.setTotalSalary(dailyRate);
                dto.setIsPresent(true);
                
                staffDetails.add(dto);
                managerTotalCost = managerTotalCost.add(dailyRate);
                managerCount++;
            }
        }
        
        // 2. Process Workers (placeholder - will integrate with existing worker attendance)
        // TODO: Integrate with actual worker attendance system
        // For now, returning empty worker list
        BigDecimal workerTotalCost = BigDecimal.ZERO;
        int workerCount = 0;
        
        // Once you have worker attendance data, uncomment and modify:
        /*
        List<WorkerAttendance> workerAttendances = workerAttendanceRepository.findByAttendanceDate(reportDate);
        for (WorkerAttendance attendance : workerAttendances) {
            Worker worker = attendance.getWorker();
            BigDecimal hourlyRate = worker.getPosition().getHourlyRate();
            BigDecimal hoursWorked = attendance.getHoursWorked();
            BigDecimal totalSalary = hourlyRate.multiply(hoursWorked);
            
            // Create report entry and DTO similar to managers above
            // ...
            
            workerTotalCost = workerTotalCost.add(totalSalary);
            workerCount++;
        }
        */
        
        // 3. Calculate totals
        BigDecimal totalCost = workerTotalCost.add(managerTotalCost);
        
        // 4. Create summary
        ConsolidatedSalarySummary summary = new ConsolidatedSalarySummary();
        summary.setReportDate(reportDate);
        summary.setTotalWorkers(workerCount);
        summary.setTotalManagers(managerCount);
        summary.setWorkerTotalCost(workerTotalCost);
        summary.setManagerTotalCost(managerTotalCost);
        summary.setTotalCost(totalCost);
        summary.setStaffDetails(staffDetails);
        
        return summary;
    }
    
    // Get report by date
    public ConsolidatedSalarySummary getReportByDate(LocalDate reportDate) {
        List<DailySalaryReport> reports = reportRepository.findByReportDate(reportDate);
        
        if (reports.isEmpty()) {
            return null;
        }
        
        List<DailySalaryReportDTO> staffDetails = new ArrayList<>();
        BigDecimal workerTotalCost = BigDecimal.ZERO;
        BigDecimal managerTotalCost = BigDecimal.ZERO;
        int workerCount = 0;
        int managerCount = 0;
        
        for (DailySalaryReport report : reports) {
            DailySalaryReportDTO dto = new DailySalaryReportDTO();
            dto.setStaffId(report.getStaffId());
            dto.setStaffName(report.getStaffName());
            dto.setStaffType(report.getStaffType());
            dto.setPositionRole(report.getPositionRole());
            dto.setRateType(report.getRateType());
            dto.setRateAmount(report.getRateAmount());
            dto.setHoursOrDays(report.getHoursOrDays());
            dto.setTotalSalary(report.getTotalSalary());
            dto.setIsPresent(report.getIsPresent());
            
            staffDetails.add(dto);
            
            if ("WORKER".equals(report.getStaffType())) {
                workerTotalCost = workerTotalCost.add(report.getTotalSalary());
                workerCount++;
            } else if ("MANAGER".equals(report.getStaffType())) {
                managerTotalCost = managerTotalCost.add(report.getTotalSalary());
                managerCount++;
            }
        }
        
        ConsolidatedSalarySummary summary = new ConsolidatedSalarySummary();
        summary.setReportDate(reportDate);
        summary.setTotalWorkers(workerCount);
        summary.setTotalManagers(managerCount);
        summary.setWorkerTotalCost(workerTotalCost);
        summary.setManagerTotalCost(managerTotalCost);
        summary.setTotalCost(workerTotalCost.add(managerTotalCost));
        summary.setStaffDetails(staffDetails);
        
        return summary;
    }
    
    // Get report history (list of all dates with reports)
    public List<LocalDate> getReportHistory() {
        return reportRepository.findDistinctReportDates();
    }
    
    // Get summary for history view
    public List<ConsolidatedSalarySummary> getReportHistoryWithSummaries() {
        List<LocalDate> dates = getReportHistory();
        List<ConsolidatedSalarySummary> summaries = new ArrayList<>();
        
        for (LocalDate date : dates) {
            ConsolidatedSalarySummary summary = getReportByDate(date);
            if (summary != null) {
                // Only include summary info, not full details
                summary.setStaffDetails(null);
                summaries.add(summary);
            }
        }
        
        return summaries;
    }
    
    // Check if report exists for date
    public boolean reportExists(LocalDate date) {
        return reportRepository.existsByReportDate(date);
    }
}
