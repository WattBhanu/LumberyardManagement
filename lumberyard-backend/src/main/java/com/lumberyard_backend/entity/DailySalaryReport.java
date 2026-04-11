package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_salary_reports", indexes = {
    @Index(name = "idx_report_date", columnList = "report_date")
})
public class DailySalaryReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;
    
    @Column(name = "staff_type", nullable = false)
    private String staffType; // "WORKER" or "MANAGER"
    
    @Column(name = "staff_id", nullable = false)
    private Long staffId;
    
    @Column(name = "staff_name", nullable = false)
    private String staffName;
    
    @Column(name = "position_role", nullable = false)
    private String positionRole;
    
    @Column(name = "rate_type", nullable = false)
    private String rateType; // "HOURLY" or "DAILY"
    
    @Column(name = "rate_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rateAmount;
    
    @Column(name = "hours_or_days", nullable = false, precision = 10, scale = 2)
    private BigDecimal hoursOrDays;
    
    @Column(name = "total_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalSalary;
    
    @Column(name = "is_present", nullable = false)
    private Boolean isPresent;
    
    @Column(name = "generated_by", nullable = false)
    private String generatedBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
