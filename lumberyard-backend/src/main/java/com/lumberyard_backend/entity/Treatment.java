package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_process")
@Data
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "timber_id", nullable = false)
    private Timber timber;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private TreatmentStatus status;

    private String chemicalType; // e.g., "Preservative", "Stain", "Sealer"
    private double timberQuantity; // Quantity of timber being treated
    private double chemicalQuantity; // Quantity of chemical used (for display only, not deducted)
}
