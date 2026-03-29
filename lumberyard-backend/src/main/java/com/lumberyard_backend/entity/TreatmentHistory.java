package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TreatmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "treatment_id", nullable = false)
    private TreatmentProcess treatment;

    @Enumerated(EnumType.STRING)
    private TreatmentStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private TreatmentStatus toStatus;

    private LocalDateTime changeTime;

    private String eventType; // STATUS_CHANGE, STARTED, FINISHED, CANCELLED, DELETED

    private String notes; // Additional info like "Treatment started", "Status changed from X to Y"

    public TreatmentHistory() {
        this.changeTime = LocalDateTime.now();
    }

    public TreatmentHistory(TreatmentProcess treatment, TreatmentStatus fromStatus, TreatmentStatus toStatus, String eventType, String notes) {
        this.treatment = treatment;
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

    public TreatmentProcess getTreatment() {
        return treatment;
    }

    public void setTreatment(TreatmentProcess treatment) {
        this.treatment = treatment;
    }

    public TreatmentStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(TreatmentStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public TreatmentStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(TreatmentStatus toStatus) {
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
