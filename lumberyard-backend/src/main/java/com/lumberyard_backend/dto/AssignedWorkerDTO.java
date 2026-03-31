package com.lumberyard_backend.dto;

import lombok.Data;

@Data
public class AssignedWorkerDTO {
    private Long id;
    private Long workerId;
    private String workerName;
    private String position;
    private String role; // EMPLOYEE or SUPERVISOR
}
