package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.TreatmentRequest;
import com.lumberyard_backend.entity.TreatmentHistory;
import com.lumberyard_backend.entity.TreatmentProcess;
import com.lumberyard_backend.service.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatment")
@CrossOrigin(origins = "*")
public class TreatmentController {

    @Autowired
    private TreatmentService treatmentService;

    // Start a new treatment process
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

    // Finish treatment process
    @PostMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> finishTreatment(@PathVariable Long id) {
        try {
            TreatmentProcess treatment = treatmentService.finishTreatment(id);
            // Return additional info about the new timber
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("treatment", treatment);
            response.put("message", "Treatment completed successfully! New treated timber created.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cancel treatment process
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<TreatmentProcess> cancelTreatment(@PathVariable Long id) {
        TreatmentProcess treatment = treatmentService.cancelTreatment(id);
        return ResponseEntity.ok(treatment);
    }

    // Delete treatment process (soft delete - creates history record, sets status to DELETED)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteTreatment(@PathVariable Long id) {
        try {
            TreatmentProcess treatment = treatmentService.deleteTreatment(id);
            return ResponseEntity.ok().body(java.util.Map.of(
                "message", "Treatment moved to history successfully",
                "treatmentId", id,
                "status", "DELETED"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Get active treatments
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentProcess>> getActiveTreatments() {
        return ResponseEntity.ok(treatmentService.getActiveTreatments());
    }

    // Get completed treatments
    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentProcess>> getCompletedTreatments() {
        return ResponseEntity.ok(treatmentService.getCompletedTreatments());
    }

    // Get all treatment history
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentHistory>> getTreatmentHistory() {
        return ResponseEntity.ok(treatmentService.getTreatmentHistory());
    }

    // Get history by treatment ID
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<List<TreatmentHistory>> getHistoryByTreatmentId(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentService.getHistoryByTreatmentId(id));
    }

    // Permanently delete a treatment and its history
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> permanentDelete(@PathVariable Long id) {
        treatmentService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Delete all treatment history (admin only)
    @DeleteMapping("/history/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllHistory(@RequestParam String token) {
        treatmentService.deleteAllHistory(token);
        return ResponseEntity.noContent().build();
    }

    // Delete a single treatment history record by history ID (admin only)
    @DeleteMapping("/history/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHistoryRecord(@PathVariable Long historyId) {
        treatmentService.deleteHistoryRecord(historyId);
        return ResponseEntity.noContent().build();
    }
}
