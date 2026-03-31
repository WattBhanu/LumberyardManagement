package com.lumberyard_backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class JobAssignmentDTO {
    private Long id;
    private String jobId;
    private String jobName;
    private LocalDate date;
    private Integer requiredEmployees;
    private Integer requiredSupervisors;
    private String status;
    private Long assignedEmployeesCount;
    private Long assignedSupervisorsCount;
    private Map<String, Integer> positionRequirements;
    private Map<String, Long> assignedPositionsCount;
    private List<AssignedWorkerDTO> assignedWorkers;
}
