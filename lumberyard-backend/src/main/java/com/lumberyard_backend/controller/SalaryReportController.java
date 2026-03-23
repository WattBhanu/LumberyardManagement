package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.SalaryReportResponse;
import com.lumberyard_backend.dto.SalaryReportResponse.SalaryReportItem;
import com.lumberyard_backend.entity.Attendance;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.AttendanceRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import com.lumberyard_backend.service.SalaryCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/salary/reports")
@CrossOrigin(origins = "*")
public class SalaryReportController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SalaryCalculationService salaryCalculationService;

    @GetMapping("/daily")
    public SalaryReportResponse getDailyReport(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam int day) {
        
        LocalDate date = LocalDate.of(year, month, day);
        List<Worker> workers = workerRepository.findAll();
        List<SalaryReportItem> items = new ArrayList<>();
        double totalPayroll = 0;

        for (Worker worker : workers) {
            Optional<Attendance> attendanceOpt = attendanceRepository.findByWorker_IdAndDate(worker.getId(), date);
            SalaryReportItem item = new SalaryReportItem();
            item.setWorkerName(worker.getFirstName() + " " + worker.getLastName());
            item.setPosition(worker.getPosition());
            item.setDepartment(worker.getDepartment());

            if (attendanceOpt.isPresent()) {
                Attendance attendance = attendanceOpt.get();
                boolean isPresent = "Present".equalsIgnoreCase(attendance.getStatus());
                item.setPresentDays(isPresent ? 1 : 0);
                item.setAbsentDays(isPresent ? 0 : 1);
                item.setTotalHours(attendance.getWorkedHours() != null ? attendance.getWorkedHours() : 0);
                item.setAttendancePercentage(isPresent ? 100 : 0);
                
                double hourlyWage = salaryCalculationService.calculateHourlyWage(worker);
                double dailySalary = salaryCalculationService.calculateDailySalary(hourlyWage, item.getTotalHours());
                item.setTotalSalary(dailySalary);
                totalPayroll += dailySalary;
            } else {
                item.setPresentDays(0);
                item.setAbsentDays(1);
                item.setTotalHours(0);
                item.setAttendancePercentage(0);
                item.setTotalSalary(0);
            }
            items.add(item);
        }

        SalaryReportResponse response = new SalaryReportResponse();
        response.setItems(items);
        response.setTotalPayroll(totalPayroll);
        response.setAverageSalary(items.isEmpty() ? 0 : totalPayroll / items.size());
        return response;
    }

    @GetMapping("/monthly")
    public SalaryReportResponse getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        List<Worker> workers = workerRepository.findAll();
        List<SalaryReportItem> items = new ArrayList<>();
        double totalPayroll = 0;

        int daysInMonth = endDate.getDayOfMonth();

        for (Worker worker : workers) {
            List<Attendance> attendances = attendanceRepository.findByWorker_IdAndDateBetween(worker.getId(), startDate, endDate);
            SalaryReportItem item = new SalaryReportItem();
            item.setWorkerName(worker.getFirstName() + " " + worker.getLastName());
            item.setPosition(worker.getPosition());
            item.setDepartment(worker.getDepartment());

            int presentDays = 0;
            double totalHours = 0;
            for (Attendance a : attendances) {
                if ("Present".equalsIgnoreCase(a.getStatus())) {
                    presentDays++;
                    totalHours += (a.getWorkedHours() != null ? a.getWorkedHours() : 0);
                }
            }

            item.setPresentDays(presentDays);
            item.setAbsentDays(daysInMonth - presentDays);
            item.setTotalHours(totalHours);
            item.setAttendancePercentage(((double) presentDays / daysInMonth) * 100);
            
            double hourlyWage = salaryCalculationService.calculateHourlyWage(worker);
            double monthlySalary = salaryCalculationService.calculateDailySalary(hourlyWage, totalHours);
            item.setTotalSalary(monthlySalary);
            totalPayroll += monthlySalary;
            
            items.add(item);
        }

        SalaryReportResponse response = new SalaryReportResponse();
        response.setItems(items);
        response.setTotalPayroll(totalPayroll);
        response.setAverageSalary(items.isEmpty() ? 0 : totalPayroll / items.size());
        return response;
    }
}
