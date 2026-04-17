package com.lumberyard_backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Profit & Loss Report
 * 
 * SRP (Single Responsibility Principle): This DTO is solely responsible for 
 * carrying profit/loss report data between service and controller layers.
 * 
 * OCP (Open/Closed Principle): Can be extended with additional fields 
 * (e.g., monthly breakdown, categories) without modifying existing structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfitLossReportDTO {
    
    private LocalDate date;
    private Double totalIncome;
    private Double totalExpenses;
    private Double totalSalary;
    private Double net;
    private String status; // "Profit", "Loss", or "Break-even"
    
    /**
     * Constructor to create a report entry with calculated net and status
     */
    public ProfitLossReportDTO(LocalDate date, Double totalIncome, Double totalExpenses, Double totalSalary) {
        this.date = date;
        this.totalIncome = totalIncome != null ? totalIncome : 0.0;
        this.totalExpenses = totalExpenses != null ? totalExpenses : 0.0;
        this.totalSalary = totalSalary != null ? totalSalary : 0.0;
        this.net = this.totalIncome - (this.totalExpenses + this.totalSalary);
        this.status = calculateStatus();
    }
    
    /**
     * Calculates the status based on net value
     */
    private String calculateStatus() {
        if (net > 0) {
            return "Profit";
        } else if (net < 0) {
            return "Loss";
        } else {
            return "Break-even";
        }
    }
}
