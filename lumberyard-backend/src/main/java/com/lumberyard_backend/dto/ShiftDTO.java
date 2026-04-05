package com.lumberyard_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ShiftDTO {
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate date;
    private List<ShiftWorkerAssignmentDTO> workerAssignments;
    private int totalWorkers;
}
