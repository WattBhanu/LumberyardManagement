package com.lumberyard_backend.dto;

import com.lumberyard_backend.entity.Worker;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkerDTO {
    private Long workerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    private String department;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String address;
    private Worker.WorkerStatus status;
    private String skills;
    private String certifications;
    private Boolean isAvailable;
}
