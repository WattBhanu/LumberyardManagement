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
    public ResponseEntity<?> createProduction(@RequestBody ProductionRequest request) {
        Timber timber = timberRepository.findByTimberCode(request.getTimberCode());
        if (timber == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Timber not found");
        }

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
    public List<Production> getAllProductions() {
        return productionRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        if (!productionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Production not found");
        }
        productionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/timber")
    public List<Timber> getTreatedTimber() {
        return timberRepository.findByStatusIgnoreCase("treated");
    }
}
