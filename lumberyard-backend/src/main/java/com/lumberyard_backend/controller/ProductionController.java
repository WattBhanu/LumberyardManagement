package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ProductionRequest;
import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionStatus;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.ProductionRepository;
import com.lumberyard_backend.repository.TimberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductionController {

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private TimberRepository timberRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> createProduction(@RequestBody ProductionRequest request) {
        Timber timber = timberRepository.findByTimberCode(request.getTimberCode());
        if (timber == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Timber not found");
        }

        // Validate: Check if requested amount is available
        if (request.getAmount() > timber.getQuantity()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Insufficient timber quantity. Available: " + timber.getQuantity() + ", Requested: " + request.getAmount());
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
        return ResponseEntity.ok(savedProduction);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Production> getAllProductions() {
        return productionRepository.findAll();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        if (!productionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        productionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> finishProduction(@PathVariable Long id) {
        Production production = productionRepository.findById(id).orElse(null);
        if (production == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        production.setStatus(ProductionStatus.FINISHED);
        production.setEndTime(LocalDateTime.now());
        productionRepository.save(production);
        return ResponseEntity.ok(production);
    }

    @GetMapping("/timber")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Timber> getTreatedTimber() {
        return timberRepository.findByStatusIgnoreCase("treated");
    }
}
