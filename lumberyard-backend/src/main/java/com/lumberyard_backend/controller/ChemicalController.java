package com.lumberyard_backend.controller;

import org.springframework.http.ResponseEntity;
import com.lumberyard_backend.entity.Chemical;
import com.lumberyard_backend.repository.ChemicalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chemical")
@CrossOrigin(origins = "http://localhost:3000")
public class ChemicalController {

    @Autowired
    private ChemicalRepository chemicalRepository;

    // GET ALL
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Chemical> getAllChemicals() {
        return chemicalRepository.findAll();
    }

    // SEARCH
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Chemical> searchChemical(@RequestParam String code) {
        return chemicalRepository.findByChemicalCodeContainingIgnoreCase(code);
    }

    // ADD
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addChemical(@RequestBody Chemical chemical) {

        if (chemicalRepository.existsByChemicalCode(chemical.getChemicalCode())) {
            return ResponseEntity
                    .badRequest()
                    .body("Chemical code already exists!");
        }

        chemicalRepository.save(chemical);
        return ResponseEntity.ok("Chemical added successfully!");
    }

    // REDUCE STOCK
    @PutMapping("/reduce")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> reduceChemicalStock(
            @RequestParam String chemicalCode,
            @RequestParam double quantity) {

        Chemical c = chemicalRepository.findByChemicalCode(chemicalCode);

        if (c == null)
            return ResponseEntity.badRequest().body("Chemical not found!");

        if (c.getQuantity() < quantity)
            return ResponseEntity.badRequest().body("Not enough stock!");

        c.setQuantity(c.getQuantity() - quantity);
        chemicalRepository.save(c);

        return ResponseEntity.ok("Stock updated successfully!");
    }

    // ADD STOCK
    @PutMapping("/addStock")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addChemicalStock(
            @RequestParam String chemicalCode,
            @RequestParam double quantity) {

        Chemical chemical = chemicalRepository.findByChemicalCode(chemicalCode);

        if (chemical == null) {
            return ResponseEntity.badRequest().body("Chemical not found!");
        }

        chemical.setQuantity(chemical.getQuantity() + quantity);
        chemicalRepository.save(chemical);

        return ResponseEntity.ok("Stock added successfully!");
    }

    // ✅ DELETE CHEMICAL
    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteChemical(@RequestParam String chemicalCode) {

        Chemical chemical = chemicalRepository.findByChemicalCode(chemicalCode);

        if (chemical == null) {
            return ResponseEntity.badRequest().body("Chemical not found!");
        }

        chemicalRepository.deleteByChemicalCode(chemicalCode);

        return ResponseEntity.ok("Chemical deleted successfully!");
    }
}