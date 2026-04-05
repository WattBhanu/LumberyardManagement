package com.lumberyard_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ShiftScheduleDTO {
    private LocalDate date;
    private List<ShiftDTO> shifts;
    private List<JobAssignmentDTO> jobs;
}
