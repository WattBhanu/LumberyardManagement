package com.lumberyard_backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class JobUpdateDTO {
    private String jobName;
    private LocalDate date;
    private Integer requiredEmployees;
    private Integer requiredSupervisors;
    private Map<String, Integer> positionRequirements;
    private String status;
}
