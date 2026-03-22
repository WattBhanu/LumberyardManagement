package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.TimberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timber")
@CrossOrigin(origins = "http://localhost:3000")
public class TimberController {

    @Autowired
    private TimberRepository timberRepository;

    // Get all timbers
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Timber> getAllTimbers() {
        return timberRepository.findAll();
    }

    // Search by timber code (partial match)
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Timber> searchTimber(@RequestParam String code) {
        return timberRepository.findByTimberCodeContainingIgnoreCase(code);
    }

    // Add new timber
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addTimber(@RequestBody Timber timber) {

        if (timberRepository.existsByTimberCode(timber.getTimberCode())) {
            return ResponseEntity.badRequest().body("Timber code already exists!");
        }

        timberRepository.save(timber);
        return ResponseEntity.ok("Timber added successfully!");
    }

    // Reduce Timber Quantity
    @PutMapping("/reduce")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> reduceTimberStock(
            @RequestParam String timberCode,
            @RequestParam double quantity) {

        Timber timber = timberRepository.findByTimberCode(timberCode);

        if (timber == null)
            return ResponseEntity.badRequest().body("Timber not found!");

        if (timber.getQuantity() < quantity)
            return ResponseEntity.badRequest().body("Not enough stock!");

        timber.setQuantity(timber.getQuantity() - quantity);
        timberRepository.save(timber);

        return ResponseEntity.ok("Stock updated successfully!");
    }

    // Add Timber Stock
    @PutMapping("/addStock")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addTimberStock(
            @RequestParam String timberCode,
            @RequestParam double quantity) {

        Timber timber = timberRepository.findByTimberCode(timberCode);

        if (timber == null)
            return ResponseEntity.badRequest().body("Timber not found!");

        timber.setQuantity(timber.getQuantity() + quantity);
        timberRepository.save(timber);

        return ResponseEntity.ok("Stock added successfully!");
    }

    // ✅ DELETE TIMBER
    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteTimber(@RequestParam String timberCode) {

        Timber timber = timberRepository.findByTimberCode(timberCode);

        if (timber == null) {
            return ResponseEntity.badRequest().body("Timber not found!");
        }

        timberRepository.deleteByTimberCode(timberCode);

        return ResponseEntity.ok("Timber deleted successfully!");
    }
}