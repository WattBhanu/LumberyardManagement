package com.lumberyard_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.Map;

@Data
public class JobCreateDTO {
    private String jobId;
    private String jobName;
    private String customJobName;
    private LocalDate date;
    private Integer employees;
    private Integer supervisors;
    
    // New fields for position-based requirements
    private Map<String, Integer> positionRequirements;
    private Integer totalWorkers;
}
