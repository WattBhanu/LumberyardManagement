package com.lumberyard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerSalaryResponse {
    private Long id;
    private Long managerId;
    private String managerName;
    private String managerEmail;
    private String managerRole;
    private Double currentDailyRate;
    private Double previousDailyRate;
    private Double newDailyRate;
    private LocalDate effectiveDate;
    private String reason;
    private LocalDateTime createdAt;
    private String createdBy;
}
