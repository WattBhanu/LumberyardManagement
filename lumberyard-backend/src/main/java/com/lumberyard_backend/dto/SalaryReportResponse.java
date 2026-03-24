package com.lumberyard_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SalaryReportResponse {
    private List<SalaryReportItem> items;
    private double totalPayroll;
    private double averageSalary;

    @Data
    public static class SalaryReportItem {
        private String workerName;
        private int presentDays; // 1 or 0 for daily, count for monthly
        private int absentDays;  // 1 or 0 for daily, count for monthly
        private double totalHours;
        private double attendancePercentage;
        private String position;
        private String department;
        private double totalSalary;
    }
}
