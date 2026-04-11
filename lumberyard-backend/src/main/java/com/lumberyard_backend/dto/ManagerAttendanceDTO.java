package com.lumberyard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerAttendanceDTO {
    private Long managerId;
    private String managerName;
    private String managerRole;
    private Boolean isPresent;
}
