package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class MaterialUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String materialType;

    @Column(nullable = false)
    private String materialCode;

    @Column(nullable = false)
    private double quantity;

    private String purpose;

    @Column(nullable = false)
    private LocalDateTime usageTime;
}
