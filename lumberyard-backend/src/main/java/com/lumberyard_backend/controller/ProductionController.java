package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ProductionRequest;
import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionHistory;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductionController {

    @Autowired
    private ProductionService productionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> createProduction(@RequestBody ProductionRequest request) {
        try {
            Production production = productionService.createProduction(
                    request.getTimberCode(),
                    request.getProcessType(),
                    request.getAmount()
            );
            return ResponseEntity.ok(production);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Production> getAllProductions() {
        return productionService.getActiveProductions();
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<ProductionHistory> getAllProductionHistory() {
        return productionService.getAllProductionHistory();
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> getProductionHistory(@PathVariable Long id) {
        List<ProductionHistory> history = productionService.getHistoryByProductionId(id);
        if (history == null || history.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production or history not found");
        }
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{historyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHistoryRecord(@PathVariable Long historyId) {
        productionService.deleteHistoryRecord(historyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> permanentlyDeleteProduction(@PathVariable Long id) {
        try {
            productionService.permanentDelete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/history/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllHistory(@RequestParam(required = false) String token) {
        try {
            productionService.deleteAllHistory(token);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        try {
            Production production = productionService.updateStatus(id, statusMap.get("status"));
            return ResponseEntity.ok(production);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> finishProduction(@PathVariable Long id) {
        try {
            Production production = productionService.finishProduction(id);
            return ResponseEntity.ok(production);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> cancelProduction(@PathVariable Long id) {
        try {
            Production production = productionService.cancelProduction(id);
            return ResponseEntity.ok(production);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        try {
            productionService.deleteProduction(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/timber")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Timber> getTreatedTimber() {
        return productionService.getTreatedTimber();
    }
}
