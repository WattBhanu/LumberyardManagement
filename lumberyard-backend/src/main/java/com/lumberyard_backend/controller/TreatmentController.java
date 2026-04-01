package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.TreatmentRequest;
import com.lumberyard_backend.entity.TreatmentHistory;
import com.lumberyard_backend.entity.TreatmentProcess;
import com.lumberyard_backend.entity.TreatmentStatus;
import com.lumberyard_backend.service.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/treatment")
@CrossOrigin(origins = "*")
public class TreatmentController {

    @Autowired
    private TreatmentService treatmentService;

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<TreatmentProcess> startTreatment(@RequestBody TreatmentRequest request) {
        TreatmentProcess treatment = treatmentService.startTreatment(
                request.getTimberId(),
                request.getChemicalType(),
                request.getTimberQuantity(),
                request.getChemicalQuantity()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(treatment);
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> finishTreatment(@PathVariable Long id) {
        try {
            TreatmentProcess treatment = treatmentService.finishTreatment(id);
            Map<String, Object> response = new HashMap<>();
            response.put("treatment", treatment);
            response.put("message", "Treatment completed successfully! New treated timber created.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<TreatmentProcess> cancelTreatment(@PathVariable Long id) {
        TreatmentProcess treatment = treatmentService.cancelTreatment(id);
        return ResponseEntity.ok(treatment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteTreatment(@PathVariable Long id) {
        try {
            treatmentService.deleteTreatment(id);
            return ResponseEntity.ok().body(Map.of(
                    "message", "Treatment moved to history successfully",
                    "treatmentId", id,
                    "status", "DELETED"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentProcess>> getActiveTreatments() {
        return ResponseEntity.ok(treatmentService.getActiveTreatments());
    }

    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentProcess>> getCompletedTreatments() {
        return ResponseEntity.ok(treatmentService.getCompletedTreatments());
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentHistory>> getTreatmentHistory() {
        return ResponseEntity.ok(treatmentService.getTreatmentHistory());
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentHistory>> getHistoryByTreatmentId(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentService.getHistoryByTreatmentId(id));
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> permanentDelete(@PathVariable Long id) {
        treatmentService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/history/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllHistory(@RequestParam String token) {
        treatmentService.deleteAllHistory(token);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/history/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHistoryRecord(@PathVariable Long historyId) {
        treatmentService.deleteHistoryRecord(historyId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        TreatmentProcess treatment = treatmentService.findById(id);
        if (treatment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Treatment not found");
        }

        String statusStr = statusMap.get("status");
        try {
            TreatmentStatus newStatus = TreatmentStatus.valueOf(statusStr);
            TreatmentStatus oldStatus = treatment.getStatus();

            if (oldStatus == TreatmentStatus.FINISHED || oldStatus == TreatmentStatus.CANCELLED || oldStatus == TreatmentStatus.DELETED) {
                return ResponseEntity.badRequest().body("Cannot modify a completed, cancelled, or deleted process");
            }

            if (newStatus == TreatmentStatus.FINISHED) {
                treatment.setStatus(TreatmentStatus.FINISHED);
                treatment.setEndTime(LocalDateTime.now());
                treatmentService.save(treatment);

                TreatmentHistory history = new TreatmentHistory(
                        treatment,
                        oldStatus,
                        TreatmentStatus.FINISHED,
                        "FINISHED",
                        "Treatment finished. Total time: " + calculateDuration(treatment.getStartTime(), treatment.getEndTime())
                );
                treatmentService.saveHistory(history);
            } else {
                treatment.setStatus(newStatus);
                treatmentService.save(treatment);

                TreatmentHistory history = new TreatmentHistory(
                        treatment,
                        oldStatus,
                        newStatus,
                        "STATUS_CHANGE",
                        "Status changed from " + oldStatus + " to " + newStatus
                );
                treatmentService.saveHistory(history);
            }

            return ResponseEntity.ok(treatment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }

    private String calculateDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return "N/A";
        java.time.Duration duration = java.time.Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        return hours + "h " + minutes + "m";
    }
}