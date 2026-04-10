package com.lumberyard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerSalaryUpdateRequest {
    private Long managerId;
    private Double newDailyRate;
    private LocalDate effectiveDate;
    private String reason;
}
