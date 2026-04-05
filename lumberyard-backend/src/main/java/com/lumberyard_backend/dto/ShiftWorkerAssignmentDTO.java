package com.lumberyard_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ShiftWorkerAssignmentDTO {
    private Long id;
    private Long shiftId;
    private String shiftName;
    private Long workerId;
    private String workerName;
    private String workerPosition;
    private Long jobAssignmentId;
    private String jobName;
    private LocalDate date;
    private String status;
}
