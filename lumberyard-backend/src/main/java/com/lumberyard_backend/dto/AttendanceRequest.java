package com.lumberyard_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {
    private Long workerId;
    private LocalDate date;
    private String status;
    private String note;
    private LocalTime arrivalTime;
    private LocalTime departureTime;
}
