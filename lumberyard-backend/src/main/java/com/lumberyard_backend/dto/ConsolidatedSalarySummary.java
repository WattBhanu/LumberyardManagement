package com.lumberyard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsolidatedSalarySummary {
    private LocalDate reportDate;
    private Integer totalWorkers;
    private Integer totalManagers;
    private BigDecimal workerTotalCost;
    private BigDecimal managerTotalCost;
    private BigDecimal totalCost;
    private List<DailySalaryReportDTO> staffDetails;
}
