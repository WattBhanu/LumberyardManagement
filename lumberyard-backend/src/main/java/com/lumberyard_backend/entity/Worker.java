package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "workers")
@Data
public class Worker {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worker_id")
    private Long workerId;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true)
    private String phone;
    
    @Column(nullable = false)
    private String position;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    private LocalDate hireDate;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(nullable = false)
    private Double hourlyRate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkerStatus status = WorkerStatus.ACTIVE;
    
    // Helper method to set status from string (case-insensitive)
    public void setStatusFromString(String status) {
        if (status != null) {
            try {
                this.status = WorkerStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Default to ACTIVE if invalid status
                this.status = WorkerStatus.ACTIVE;
            }
        }
    }
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    @Column(columnDefinition = "TEXT")
    private String certifications;
    
    @Column(nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum WorkerStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        TERMINATED
    }
}
