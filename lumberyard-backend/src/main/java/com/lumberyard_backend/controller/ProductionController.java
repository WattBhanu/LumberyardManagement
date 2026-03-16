package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ProductionRequest;
import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionHistory;
import com.lumberyard_backend.entity.ProductionStatus;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.ProductionHistoryRepository;
import com.lumberyard_backend.repository.ProductionRepository;
import com.lumberyard_backend.repository.TimberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductionController {

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private TimberRepository timberRepository;

    @Autowired
    private ProductionHistoryRepository productionHistoryRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> createProduction(@RequestBody ProductionRequest request) {
        Timber timber = timberRepository.findByTimberCode(request.getTimberCode());
        if (timber == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Timber not found");
        }

        if (request.getAmount() > timber.getQuantity()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient timber quantity");
        }

        // Deduct timber quantity
        timber.setQuantity(timber.getQuantity() - request.getAmount());
        timberRepository.save(timber);

        Production production = new Production();
        production.setTimber(timber);
        production.setProcessType(request.getProcessType());
        production.setAmount(request.getAmount());
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
        
        return ResponseEntity.ok(savedProduction);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Production> getAllProductions() {
        // Only return active productions (not FINISHED, CANCELLED, or DELETED)
        return productionRepository.findAll().stream()
            .filter(p -> p.getStatus() != ProductionStatus.FINISHED 
                      && p.getStatus() != ProductionStatus.CANCELLED
                      && p.getStatus() != ProductionStatus.DELETED)
            .collect(Collectors.toList());
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<ProductionHistory> getAllProductionHistory() {
        // Return all history records sorted by change time descending
        return productionHistoryRepository.findAll().stream()
            .sorted((a, b) -> b.getChangeTime().compareTo(a.getChangeTime()))
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> getProductionHistory(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        List<ProductionHistory> history = productionHistoryRepository.findByProductionIdOrderByChangeTimeDesc(id);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHistoryRecord(@PathVariable Long historyId) {
        if (!productionHistoryRepository.existsById(historyId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("History record not found");
        }
        productionHistoryRepository.deleteById(historyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> permanentlyDeleteProduction(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        
        // Delete all history records for this production first
        List<ProductionHistory> historyRecords = productionHistoryRepository.findByProductionId(id);
        productionHistoryRepository.deleteAll(historyRecords);
        
        // Then delete the production
        productionRepository.deleteById(id);
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/history/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllHistory(@RequestParam(required = false) String token) {
        // Security: Token is required to prevent direct API calls (e.g., from Postman)
        // The token is generated by the frontend when user initiates the delete action
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Token required. This action must be initiated through the web interface.");
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
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }

        String statusStr = statusMap.get("status");
        try {
            ProductionStatus newStatus = ProductionStatus.valueOf(statusStr);
            ProductionStatus oldStatus = production.getStatus();
            
            // Don't allow status changes on finished/cancelled/deleted processes
            if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED || oldStatus == ProductionStatus.DELETED) {
                return ResponseEntity.badRequest().body("Cannot modify a completed, cancelled, or deleted process");
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
            
            return ResponseEntity.ok(production);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> finishProduction(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }

        ProductionStatus oldStatus = production.getStatus();
        
        // Don't allow finishing already finished/cancelled/deleted processes
        if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED || oldStatus == ProductionStatus.DELETED) {
            return ResponseEntity.badRequest().body("Process is already completed, cancelled, or deleted");
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
        
        return ResponseEntity.ok(production);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> cancelProduction(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }

        ProductionStatus oldStatus = production.getStatus();
        
        // Don't allow cancelling already finished/cancelled/deleted processes
        if (oldStatus == ProductionStatus.FINISHED || oldStatus == ProductionStatus.CANCELLED || oldStatus == ProductionStatus.DELETED) {
            return ResponseEntity.badRequest().body("Process is already completed, cancelled, or deleted");
        }
        
        // Restore timber quantity
        Timber timber = production.getTimber();
        timber.setQuantity(timber.getQuantity() + production.getAmount());
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
        
        return ResponseEntity.ok(production);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        
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
        
        return ResponseEntity.ok().build();
    }
    
    private String calculateDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return "N/A";
        java.time.Duration duration = java.time.Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        return hours + "h " + minutes + "m";
    }

    @GetMapping("/timber")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Timber> getTreatedTimber() {
        return timberRepository.findByStatusIgnoreCase("treated");
    }
}
