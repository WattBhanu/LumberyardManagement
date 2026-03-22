package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ProductionRequest;
import com.lumberyard_backend.dto.ProductionStatusRequest;
import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "*")
public class ProductionController {

    @Autowired
    private ProductionService productionService;

    // Start a new production process
    @PostMapping("/start")
    public ResponseEntity<Production> startProduction(@RequestBody ProductionRequest request) {
        Production production = productionService.startProduction(request.getTimberId(), request.getProcessType(), request.getAmount());
        return ResponseEntity.status(HttpStatus.CREATED).body(production);
    }

    // Update production status
    @PutMapping("/{id}/status")
    public ResponseEntity<Production> updateStatus(@PathVariable Long id, @RequestBody ProductionStatusRequest request) {
        Production production = productionService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(production);
    }

    // Get active productions
    @GetMapping("/active")
    public ResponseEntity<List<Production>> getActiveProductions() {
        return ResponseEntity.ok(productionService.getActiveProductions());
    }

    // Get completed productions
    @GetMapping("/completed")
    public ResponseEntity<List<Production>> getCompletedProductions() {
        return ResponseEntity.ok(productionService.getCompletedProductions());
    }
}
