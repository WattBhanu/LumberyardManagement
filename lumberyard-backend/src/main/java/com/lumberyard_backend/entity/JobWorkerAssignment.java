package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "job_worker_assignments")
@Data
public class JobWorkerAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_assignment_id", nullable = false)
    private JobAssignment jobAssignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;
    
    // For backward compatibility - legacy role field
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private WorkerRole role;
    
    // Store the actual position (e.g., "Sawyer", "Team Lead", etc.)
    @Column(nullable = true)
    private String position;
    
    public enum WorkerRole {
        EMPLOYEE,
        SUPERVISOR
    }
}
