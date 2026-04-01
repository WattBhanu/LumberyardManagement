package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionHistory;
import com.lumberyard_backend.entity.ProductionStatus;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.ProductionRepository;
import com.lumberyard_backend.repository.ProductionHistoryRepository;
import com.lumberyard_backend.repository.TimberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductionService {

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private TimberRepository timberRepository;

    @Autowired
    private ProductionHistoryRepository productionHistoryRepository;

    // Find production by ID
    public Production findById(Long id) {
        return productionRepository.findById(id).orElse(null);
    }

    // Save production
    public Production save(Production production) {
        return productionRepository.save(production);
    }

    // Save production history
    public ProductionHistory saveHistory(ProductionHistory history) {
        return productionHistoryRepository.save(history);
    }

    // Create a new production process - DEDUCTS timber immediately
    @Transactional
    public Production createProduction(String timberCode, String processType, Double amount) {
        Timber timber = timberRepository.findByTimberCode(timberCode);
        if (timber == null) {
            throw new RuntimeException("Timber not found with code: " + timberCode);
        }

        if (amount > timber.getQuantity()) {
            throw new RuntimeException("Insufficient timber quantity. Available: " + timber.getQuantity());
        }

        // Deduct timber immediately from stock
        timber.setQuantity(timber.getQuantity() - amount);
        if (timber.getQuantity() <= 0) {
            timber.setStatus("Depleted");
        }
        timberRepository.save(timber);

        Production production = new Production();
        production.setTimber(timber);
        production.setProcessType(processType);
        production.setAmount(amount);
        production.setStatus(ProductionStatus.STARTED);
        production.setStartTime(LocalDateTime.now());

        Production savedProduction = productionRepository.save(production);

        // Log the start event in history
        ProductionHistory history = new ProductionHistory(
                savedProduction,
                null,
                ProductionStatus.STARTED,
                "STARTED",
                "Process started for " + savedProduction.getAmount() + " units of " + timber.getTimberCode()
        );
        productionHistoryRepository.save(history);

        return savedProduction;
    }

    // Finish production - Marks as completed
    @Transactional
    public Production finishProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found with id: " + productionId));

        ProductionStatus oldStatus = production.getStatus();

        // Don't allow finishing already finished/cancelled/deleted processes
        if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED 
            || oldStatus == ProductionStatus.DELETED) {
            throw new RuntimeException("Process is already completed, cancelled, or deleted");
        }

        // Set finish details
        production.setStatus(ProductionStatus.FINISHED);
        production.setEndTime(LocalDateTime.now());

        productionRepository.save(production);

        // Log the finish event in history
        ProductionHistory history = new ProductionHistory(
                production,
                oldStatus,
                ProductionStatus.FINISHED,
                "FINISHED",
                "Process finished. Total time: " + calculateDuration(production.getStartTime(), production.getEndTime())
        );
        productionHistoryRepository.save(history);

        return production;
    }

    // Cancel production - REFUNDS timber back to inventory
    @Transactional
    public Production cancelProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found with id: " + productionId));

        ProductionStatus oldStatus = production.getStatus();

        // Don't allow cancelling already finished/cancelled/deleted processes
        if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED 
            || oldStatus == ProductionStatus.DELETED) {
            throw new RuntimeException("Process is already completed, cancelled, or deleted");
        }

        // Restore timber quantity
        Timber timber = production.getTimber();
        timber.setQuantity(timber.getQuantity() + production.getAmount());
        // Change status back from Depleted if needed
        if ("Depleted".equalsIgnoreCase(timber.getStatus())) {
            timber.setStatus("Untreated");
        }
        timberRepository.save(timber);

        // Set cancel details
        production.setStatus(ProductionStatus.CANCELLED);
        production.setEndTime(LocalDateTime.now());

        productionRepository.save(production);

        // Log the cancel event in history
        ProductionHistory history = new ProductionHistory(
                production,
                oldStatus,
                ProductionStatus.CANCELLED,
                "CANCELLED",
                "Process cancelled. Restored " + production.getAmount() + " units to " + timber.getTimberCode()
        );
        productionHistoryRepository.save(history);

        return production;
    }

    // Delete production - Sets status to DELETED (soft delete, NO REFUND)
    @Transactional
    public Production deleteProduction(Long productionId) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found with id: " + productionId));

        ProductionStatus oldStatus = production.getStatus();

        // Delete does NOT refund timber - timber is considered unrecoverable
        // Only CANCEL refunds timber

        // Set delete details
        production.setStatus(ProductionStatus.DELETED);
        production.setEndTime(LocalDateTime.now());

        productionRepository.save(production);

        // Log the delete event in history
        ProductionHistory history = new ProductionHistory(
                production,
                oldStatus,
                ProductionStatus.DELETED,
                "DELETED",
                "Process deleted. " + production.getAmount() + " units of timber has been discarded."
        );
        productionHistoryRepository.save(history);

        return production;
    }

    // Update status
    @Transactional
    public Production updateStatus(Long productionId, String newStatusStr) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found with id: " + productionId));

        ProductionStatus oldStatus = production.getStatus();

        // Don't allow status changes on finished/cancelled/deleted processes
        if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED 
            || oldStatus == ProductionStatus.DELETED) {
            throw new RuntimeException("Cannot modify a completed, cancelled, or deleted process");
        }

        ProductionStatus newStatus;
        try {
            newStatus = ProductionStatus.valueOf(newStatusStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatusStr);
        }

        // If changing to FINISHED, use finish logic
        if (newStatus == ProductionStatus.FINISHED) {
            production.setStatus(ProductionStatus.FINISHED);
            production.setEndTime(LocalDateTime.now());
            productionRepository.save(production);

            // Log the finish event in history
            ProductionHistory history = new ProductionHistory(
                    production,
                    oldStatus,
                    ProductionStatus.FINISHED,
                    "FINISHED",
                    "Process finished. Total time: " + calculateDuration(production.getStartTime(), production.getEndTime())
            );
            productionHistoryRepository.save(history);
        } else {
            production.setStatus(newStatus);
            productionRepository.save(production);

            // Log the status change in history
            ProductionHistory history = new ProductionHistory(
                    production,
                    oldStatus,
                    newStatus,
                    "STATUS_CHANGE",
                    "Status changed from " + oldStatus + " to " + newStatus
            );
            productionHistoryRepository.save(history);
        }

        return production;
    }

    // Get all active productions
    public List<Production> getActiveProductions() {
        return productionRepository.findAll().stream()
                .filter(p -> p.getStatus() != ProductionStatus.FINISHED
                        && p.getStatus() != ProductionStatus.CANCELLED
                        && p.getStatus() != ProductionStatus.DELETED)
                .collect(Collectors.toList());
    }

    // Get all production history (sorted by most recent first)
    public List<ProductionHistory> getAllProductionHistory() {
        return productionHistoryRepository.findAll().stream()
                .sorted((a, b) -> b.getChangeTime().compareTo(a.getChangeTime()))
                .collect(Collectors.toList());
    }

    // Get history by production ID
    public List<ProductionHistory> getHistoryByProductionId(Long productionId) {
        return productionHistoryRepository.findByProductionIdOrderByChangeTimeDesc(productionId);
    }

    // Get treated timber
    public List<Timber> getTreatedTimber() {
        return timberRepository.findByStatusIgnoreCase("treated");
    }

    // Permanently delete a production and its history
    @Transactional
    public void permanentDelete(Long productionId) {
        Production production = productionRepository.findById(productionId).orElse(null);
        if (production == null) {
            throw new RuntimeException("Production not found with id: " + productionId);
        }

        // Delete all history records for this production first
        List<ProductionHistory> historyRecords = productionHistoryRepository.findByProductionId(productionId);
        productionHistoryRepository.deleteAll(historyRecords);

        // Then delete the production
        productionRepository.deleteById(productionId);
    }

    // Delete all production history (admin only)
    @Transactional
    public void deleteAllHistory(String token) {
        // Validate token (simple validation for now)
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Invalid deletion token");
        }

        // Get all productions that are in final states
        List<Production> finalStateProductions = productionRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProductionStatus.FINISHED
                        || p.getStatus() == ProductionStatus.CANCELLED
                        || p.getStatus() == ProductionStatus.DELETED)
                .collect(Collectors.toList());

        // Delete all history records and productions
        for (Production production : finalStateProductions) {
            List<ProductionHistory> historyRecords = productionHistoryRepository.findByProductionId(production.getId());
            productionHistoryRepository.deleteAll(historyRecords);
            productionRepository.delete(production);
        }

        // Also delete any orphaned history records (where production might be null)
        productionHistoryRepository.deleteAll();
    }

    // Delete a single production history record
    @Transactional
    public void deleteHistoryRecord(Long historyId) {
        ProductionHistory history = productionHistoryRepository.findById(historyId).orElse(null);
        if (history == null) {
            return;
        }

        // If it's a final state record, also delete the production
        if ("FINISHED".equals(history.getEventType()) || "CANCELLED".equals(history.getEventType()) 
            || "DELETED".equals(history.getEventType())) {
            Long productionId = history.getProduction().getId();
            // Delete all history records for this production first
            List<ProductionHistory> histories = productionHistoryRepository.findByProductionId(productionId);
            productionHistoryRepository.deleteAll(histories);
            // Then delete the production
            productionRepository.deleteById(productionId);
        } else {
            // Just delete the history record
            productionHistoryRepository.deleteById(historyId);
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
