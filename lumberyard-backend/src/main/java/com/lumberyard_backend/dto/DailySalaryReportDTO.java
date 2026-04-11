package com.lumberyard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailySalaryReportDTO {
    private Long staffId;
    private String staffName;
    private String staffType; // "WORKER" or "MANAGER"
    private String positionRole;
    private String rateType; // "HOURLY" or "DAILY"
    private BigDecimal rateAmount;
    private BigDecimal hoursOrDays;
    private BigDecimal totalSalary;
    private Boolean isPresent;
}
