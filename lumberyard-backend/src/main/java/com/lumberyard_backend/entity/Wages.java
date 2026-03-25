package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Wages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(nullable = false)
    private double dailyWage;

    @Column(nullable = false)
    private double overtimeRate;

    private String month;
    private int year;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
