package com.lumberyard_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class WorkerAssignmentDTO {
    private Long jobAssignmentId;
    private List<Long> workerIds;
    private String role; // EMPLOYEE or SUPERVISOR
}
