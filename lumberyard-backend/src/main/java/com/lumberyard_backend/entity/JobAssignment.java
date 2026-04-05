package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "job_assignments")
@Data
public class JobAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String jobId;
    
    @Column(nullable = false)
    private String jobName;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = true)
    private Integer requiredEmployees = 0;
    
    @Column(nullable = true)
    private Integer requiredSupervisors = 0;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_position_requirements", joinColumns = @JoinColumn(name = "job_id"))
    @MapKeyColumn(name = "position_name")
    @Column(name = "quantity")
    private Map<String, Integer> positionRequirements;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.PENDING;
    
    @OneToMany(mappedBy = "jobAssignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<JobWorkerAssignment> workerAssignments = new ArrayList<>();
    
    @OneToMany(mappedBy = "jobAssignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ShiftWorkerAssignment> shiftWorkerAssignments = new ArrayList<>();
    
    public enum JobStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
