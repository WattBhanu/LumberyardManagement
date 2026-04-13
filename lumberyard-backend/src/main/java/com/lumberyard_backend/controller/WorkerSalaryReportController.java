package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.SalaryReportResponse;
import com.lumberyard_backend.entity.Attendance;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.AttendanceRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import com.lumberyard_backend.service.SalaryCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/salary/reports")
@CrossOrigin(origins = "*")
public class WorkerSalaryReportController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private SalaryCalculationService salaryCalculationService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABOR_MANAGER', 'FINANCE_MANAGER')")
    public ResponseEntity<SalaryReportResponse> getDailyReport(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @RequestParam("day") int day) {
        
        LocalDate date = LocalDate.of(year, month, day);
        List<Attendance> attendances = attendanceRepository.findByDate(date);
        
        SalaryReportResponse response = new SalaryReportResponse();
        List<SalaryReportResponse.SalaryReportItem> items = new ArrayList<>();
        double totalPayroll = 0;
        
        for (Attendance a : attendances) {
            Worker w = a.getWorker();
            SalaryReportResponse.SalaryReportItem item = new SalaryReportResponse.SalaryReportItem();
            item.setWorkerName(w.getFirstName() + " " + w.getLastName());
            
            boolean present = !"Absent".equalsIgnoreCase(a.getStatus());
            item.setPresentDays(present ? 1 : 0);
            item.setAbsentDays(present ? 0 : 1);
            
            double hours = a.getWorkedHours() != null ? a.getWorkedHours() : (present ? 8.0 : 0.0);
            item.setTotalHours(hours);
            item.setAttendancePercentage(present ? 100.0 : 0.0);
            item.setPosition(w.getPosition());
            item.setDepartment(w.getDepartment());
            
            double wage = salaryCalculationService.calculateHourlyWage(w);
            double dailySalary = salaryCalculationService.calculateDailySalary(wage, hours);
            item.setTotalSalary(dailySalary);
            
            totalPayroll += dailySalary;
            items.add(item);
        }
        
        response.setItems(items);
        response.setTotalPayroll(totalPayroll);
        response.setAverageSalary(items.isEmpty() ? 0 : totalPayroll / items.size());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABOR_MANAGER', 'FINANCE_MANAGER')")
    public ResponseEntity<SalaryReportResponse> getMonthlyReport(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
            
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        int daysInMonth = yearMonth.lengthOfMonth();
        
        List<Worker> workers = workerRepository.findAll();
        
        SalaryReportResponse response = new SalaryReportResponse();
        List<SalaryReportResponse.SalaryReportItem> items = new ArrayList<>();
        double totalPayroll = 0;
        
        for (Worker w : workers) {
            List<Attendance> attendances = attendanceRepository.findByWorker_WorkerIdAndDateBetween(
                w.getWorkerId(), startDate, endDate);
                
            if (attendances.isEmpty()) continue;
            
            SalaryReportResponse.SalaryReportItem item = new SalaryReportResponse.SalaryReportItem();
            item.setWorkerName(w.getFirstName() + " " + w.getLastName());
            
            int presentDays = 0;
            int absentDays = 0;
            double totalHours = 0;
            
            for (Attendance a : attendances) {
                boolean present = !"Absent".equalsIgnoreCase(a.getStatus());
                if (present) {
                    presentDays++;
                    totalHours += a.getWorkedHours() != null ? a.getWorkedHours() : 8.0;
                } else {
                    absentDays++;
                }
            }
            
            item.setPresentDays(presentDays);
            item.setAbsentDays(absentDays);
            item.setTotalHours(totalHours);
            item.setAttendancePercentage(((double) presentDays / daysInMonth) * 100.0);
            item.setPosition(w.getPosition());
            item.setDepartment(w.getDepartment());
            
            double wage = salaryCalculationService.calculateHourlyWage(w);
            double monthlySalary = salaryCalculationService.calculateDailySalary(wage, totalHours);
            item.setTotalSalary(monthlySalary);
            
            totalPayroll += monthlySalary;
            items.add(item);
        }
        
        response.setItems(items);
        response.setTotalPayroll(totalPayroll);
        response.setAverageSalary(items.isEmpty() ? 0 : totalPayroll / items.size());
        
        return ResponseEntity.ok(response);
    }
}
