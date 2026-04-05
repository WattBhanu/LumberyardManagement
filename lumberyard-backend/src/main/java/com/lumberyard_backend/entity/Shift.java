package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shifts")
@Data
public class Shift {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // MORNING, EVENING, NIGHT
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ShiftWorkerAssignment> workerAssignments = new ArrayList<>();
    
    public enum ShiftType {
        MORNING,    // 8:00 - 12:00
        EVENING,    // 13:00 - 17:00
        NIGHT       // 19:00 - 00:00
    }
}
