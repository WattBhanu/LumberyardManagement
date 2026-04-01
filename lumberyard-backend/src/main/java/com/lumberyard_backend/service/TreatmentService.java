package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.TreatmentHistory;
import com.lumberyard_backend.entity.Treatment;
import com.lumberyard_backend.entity.TreatmentStatus;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.entity.TimberTracking;
import com.lumberyard_backend.entity.Chemical;
import com.lumberyard_backend.repository.TreatmentRepository;
import com.lumberyard_backend.repository.TreatmentHistoryRepository;
import com.lumberyard_backend.repository.TimberRepository;
import com.lumberyard_backend.repository.TimberTrackingRepository;
import com.lumberyard_backend.repository.ChemicalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TreatmentService {

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private TreatmentHistoryRepository treatmentHistoryRepository;

    @Autowired
    private TimberRepository timberRepository;

    @Autowired
    private TimberTrackingRepository timberTrackingRepository;

    @Autowired
    private ChemicalRepository chemicalRepository;

    // Find treatment by ID
    public Treatment findById(Long id) {
        return treatmentRepository.findById(id).orElse(null);
    }

    // Save treatment
    public Treatment save(Treatment treatment) {
        return treatmentRepository.save(treatment);
    }

    // Save treatment history
    public TreatmentHistory saveHistory(TreatmentHistory history) {
        return treatmentHistoryRepository.save(history);
    }

    // Start a new treatment process - DEDUCTS timber and chemicals immediately
    public Treatment startTreatment(Long timberId, String chemicalType, Double timberQuantity, Double chemicalQuantity) {
        Timber timber = timberRepository.findById(timberId)
                .orElseThrow(() -> new RuntimeException("Timber not found with id: " + timberId));

        // Validate timber is untreated (status should be "Untreated")
        if (!"Untreated".equalsIgnoreCase(timber.getStatus())) {
            throw new RuntimeException("Only untreated timber can be selected for treatment.");
        }

        // Validate that enough timber is available
        if (timber.getQuantity() < timberQuantity) {
            throw new RuntimeException("Insufficient timber quantity.");
        }

        // Find and validate chemical
        Chemical chemical = chemicalRepository.findByName(chemicalType);
        if (chemical == null) {
            throw new RuntimeException("Chemical not found: " + chemicalType);
        }
        if (chemical.getQuantity() < chemicalQuantity) {
            throw new RuntimeException("Insufficient chemical quantity. Available: " + chemical.getQuantity());
        }

        // DEDUCT timber immediately from untreated stock
        timber.setQuantity(timber.getQuantity() - timberQuantity);
        if (timber.getQuantity() <= 0) {
            timber.setStatus("Depleted");
        }
        timberRepository.save(timber);

        // DEDUCT chemical immediately from inventory
        chemical.setQuantity(chemical.getQuantity() - chemicalQuantity);
        if (chemical.getQuantity() <= 0) {
            chemical.setStatus("Depleted");
        } else {
            chemical.setStatus("Active");
        }
        chemicalRepository.save(chemical);

        Treatment treatment = new Treatment();
        treatment.setTimber(timber);
        treatment.setChemicalType(chemicalType);
        treatment.setTimberQuantity(timberQuantity);
        treatment.setChemicalQuantity(chemicalQuantity);
        treatment.setStartTime(LocalDateTime.now());
        treatment.setStatus(TreatmentStatus.STARTED);

        // Save treatment
        Treatment savedTreatment = treatmentRepository.save(treatment);

        // Create history record
        TreatmentHistory history = new TreatmentHistory(
            savedTreatment, 
            null, 
            TreatmentStatus.STARTED, 
            "STARTED", 
            "Treatment process started. Deducted " + timberQuantity + " units from " + timber.getTimberCode() + " and " + chemicalQuantity + " units of " + chemicalType
        );
        treatmentHistoryRepository.save(history);

        return savedTreatment;
    }

    // Finish treatment - Creates treated timber record (deduction already done at start)
    public Treatment finishTreatment(Long treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + treatmentId));

        TreatmentStatus previousStatus = treatment.getStatus();
        treatment.setStatus(TreatmentStatus.FINISHED);
        treatment.setEndTime(LocalDateTime.now());

        // Get the original untreated timber (already deducted at start)
        Timber originalTimber = treatment.getTimber();
        
        // Check if there's already a tracking record for this original timber
        List<TimberTracking> existingTracking = timberTrackingRepository.findByOriginalTimberId(originalTimber.getId());
        Timber treatedTimber;
        
        if (!existingTracking.isEmpty()) {
            // Reuse the existing treated timber - add quantity to it
            treatedTimber = existingTracking.get(0).getTreatedTimber();
            
            // Add the new quantity to existing treated timber
            treatedTimber.setQuantity(treatedTimber.getQuantity() + treatment.getTimberQuantity());
            timberRepository.save(treatedTimber);
            
            // Update the tracking record with new quantity
            TimberTracking tracking = existingTracking.get(0);
            tracking.setTreatedQuantity(tracking.getTreatedQuantity() + treatment.getTimberQuantity());
            timberTrackingRepository.save(tracking);
        } else {
            // Create a NEW timber record for the treated stock
            treatedTimber = new Timber();
            treatedTimber.setTimberCode(originalTimber.getTimberCode() + "-TREATED");
            treatedTimber.setName(originalTimber.getName() + " (Treated)");
            treatedTimber.setStatus("Treated");
            treatedTimber.setLength(originalTimber.getLength());
            treatedTimber.setWidth(originalTimber.getWidth());
            treatedTimber.setThickness(originalTimber.getThickness());
            treatedTimber.setLongFeet(originalTimber.getLongFeet());
            treatedTimber.setPrice(originalTimber.getPrice());
            treatedTimber.setQuantity(treatment.getTimberQuantity());
            
            timberRepository.save(treatedTimber);
            
            // Create tracking record to link treated timber to original
            TimberTracking tracking = new TimberTracking();
            tracking.setTreatedTimber(treatedTimber);
            tracking.setOriginalTimber(originalTimber);
            tracking.setTreatedQuantity(treatment.getTimberQuantity());
            timberTrackingRepository.save(tracking);
        }
        
        // No deduction here - already done at start!

        // Save treatment
        Treatment savedTreatment = treatmentRepository.save(treatment);

        // Create history record
        TreatmentHistory history = new TreatmentHistory(
            savedTreatment, 
            previousStatus, 
            TreatmentStatus.FINISHED, 
            "FINISHED", 
            "Treatment completed. Created treated timber " + treatedTimber.getTimberCode() + " (timber and chemicals were deducted at start)"
        );
        treatmentHistoryRepository.save(history);

        return savedTreatment;
    }

    // Cancel treatment - REFUNDS materials back to inventory
    public Treatment cancelTreatment(Long treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + treatmentId));

        TreatmentStatus previousStatus = treatment.getStatus();
        treatment.setStatus(TreatmentStatus.CANCELLED);
        treatment.setEndTime(LocalDateTime.now());

        // REFUND timber back to untreated stock
        Timber originalTimber = treatment.getTimber();
        originalTimber.setQuantity(originalTimber.getQuantity() + treatment.getTimberQuantity());
        // Change status back to Untreated if it was depleted
        if ("Depleted".equalsIgnoreCase(originalTimber.getStatus())) {
            originalTimber.setStatus("Untreated");
        }
        timberRepository.save(originalTimber);

        // REFUND chemical back to inventory
        Chemical chemical = chemicalRepository.findByName(treatment.getChemicalType());
        if (chemical != null) {
            chemical.setQuantity(chemical.getQuantity() + treatment.getChemicalQuantity());
            chemical.setStatus("Active");
            chemicalRepository.save(chemical);
        }

        // Save treatment
        Treatment savedTreatment = treatmentRepository.save(treatment);

        // Create history record
        TreatmentHistory history = new TreatmentHistory(
            savedTreatment, 
            previousStatus, 
            TreatmentStatus.CANCELLED, 
            "CANCELLED", 
            "Treatment cancelled. Refunded " + treatment.getTimberQuantity() + " units back to " + originalTimber.getTimberCode() + " and " + treatment.getChemicalQuantity() + " units of " + treatment.getChemicalType()
        );
        treatmentHistoryRepository.save(history);

        return savedTreatment;
    }

    // Delete treatment - Sets status to DELETED (soft delete, NO REFUND)
    public Treatment deleteTreatment(Long treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + treatmentId));

        TreatmentStatus previousStatus = treatment.getStatus();
        
        // Set status to DELETED (don't actually delete from database)
        treatment.setStatus(TreatmentStatus.DELETED);
        treatment.setEndTime(LocalDateTime.now());

        // Save the treatment with DELETED status
        Treatment savedTreatment = treatmentRepository.save(treatment);

        // Create history record - NO REFUND since materials were already deducted at start
        TreatmentHistory history = new TreatmentHistory(
            savedTreatment, 
            previousStatus, 
            TreatmentStatus.DELETED, 
            "DELETED", 
            "Treatment deleted. No refund - timber and chemicals were deducted at start and are considered lost."
        );
        treatmentHistoryRepository.save(history);

        return savedTreatment;
    }

    // Get all active treatments
    public List<Treatment> getActiveTreatments() {
        return treatmentRepository.findAll().stream()
                .filter(t -> t.getStatus() != TreatmentStatus.FINISHED 
                          && t.getStatus() != TreatmentStatus.CANCELLED
                          && t.getStatus() != TreatmentStatus.DELETED)
                .collect(Collectors.toList());
    }

    // Get all completed treatments
    public List<Treatment> getCompletedTreatments() {
        return treatmentRepository.findByStatus(TreatmentStatus.FINISHED);
    }

    // Get all treatment history (sorted by most recent first)
    public List<TreatmentHistory> getTreatmentHistory() {
        return treatmentHistoryRepository.findAll().stream()
                .sorted((h1, h2) -> h2.getChangeTime().compareTo(h1.getChangeTime()))
                .collect(Collectors.toList());
    }

    // Get history by treatment ID
    public List<TreatmentHistory> getHistoryByTreatmentId(Long treatmentId) {
        return treatmentHistoryRepository.findByTreatmentId(treatmentId);
    }

    // Permanently delete a treatment and its history
    public void permanentDelete(Long treatmentId) {
        // First delete all history records for this treatment
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByTreatmentId(treatmentId);
        treatmentHistoryRepository.deleteAll(histories);
        
        // Then delete the treatment
        treatmentRepository.deleteById(treatmentId);
    }

    // Delete all treatment history (admin only)
    public void deleteAllHistory(String token) {
        // Validate token (simple validation for now)
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Invalid deletion token");
        }
        
        // Get all treatments that are in final states
        List<Treatment> finalStateTreatments = treatmentRepository.findAll().stream()
                .filter(t -> t.getStatus() == TreatmentStatus.FINISHED
                        || t.getStatus() == TreatmentStatus.CANCELLED
                        || t.getStatus() == TreatmentStatus.DELETED)
                .collect(Collectors.toList());
        
        // Delete all history records and treatments
        for (Treatment treatment : finalStateTreatments) {
            List<TreatmentHistory> histories = treatmentHistoryRepository.findByTreatmentId(treatment.getId());
            treatmentHistoryRepository.deleteAll(histories);
            treatmentRepository.delete(treatment);
        }
        
        // Also delete any orphaned history records (where treatment might be null)
        treatmentHistoryRepository.deleteAll();
    }

    // Delete a single treatment history record
    public void deleteHistoryRecord(Long historyId) {
        TreatmentHistory history = treatmentHistoryRepository.findById(historyId).orElse(null);
        if (history == null) {
            return;
        }
        
        // If it's a final state record, also delete the treatment
        if (history.getEventType() == "FINISHED" || history.getEventType() == "CANCELLED" || history.getEventType() == "DELETED") {
            Long treatmentId = history.getTreatment().getId();
            // Delete all history records for this treatment first
            List<TreatmentHistory> histories = treatmentHistoryRepository.findByTreatmentId(treatmentId);
            treatmentHistoryRepository.deleteAll(histories);
            // Then delete the treatment
            treatmentRepository.deleteById(treatmentId);
        } else {
            // Just delete the history record
            treatmentHistoryRepository.deleteById(historyId);
        }
    }
}
