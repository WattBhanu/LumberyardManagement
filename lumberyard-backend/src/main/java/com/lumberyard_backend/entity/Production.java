package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "production")
@Data
public class Production {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "timber_id", nullable = false)
    private Timber timber;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private ProductionStatus status;

    private String processType; // e.g., "Window 4x4", "Door 4x2"
    private double amount; // Quantity of timber used
}
