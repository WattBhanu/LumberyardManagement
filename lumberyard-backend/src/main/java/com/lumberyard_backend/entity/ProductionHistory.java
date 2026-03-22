package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ProductionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "production_id", nullable = false)
    private Production production;

    @Enumerated(EnumType.STRING)
    private ProductionStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private ProductionStatus toStatus;

    private LocalDateTime changeTime;

    private String eventType; // STATUS_CHANGE, STARTED, FINISHED, CANCELLED, DELETED

    private String notes; // Additional info like "Process started", "Status changed from X to Y"

    public ProductionHistory() {
        this.changeTime = LocalDateTime.now();
    }

    public ProductionHistory(Production production, ProductionStatus fromStatus, ProductionStatus toStatus, String eventType, String notes) {
        this.production = production;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.eventType = eventType;
        this.notes = notes;
        this.changeTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Production getProduction() {
        return production;
    }

    public void setProduction(Production production) {
        this.production = production;
    }

    public ProductionStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(ProductionStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public ProductionStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(ProductionStatus toStatus) {
        this.toStatus = toStatus;
    }

    public LocalDateTime getChangeTime() {
        return changeTime;
    }

    public void setChangeTime(LocalDateTime changeTime) {
        this.changeTime = changeTime;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
