package com.lumberyard_backend.controller;

import org.springframework.http.ResponseEntity;
import com.lumberyard_backend.entity.Logs;
import com.lumberyard_backend.repository.LogsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:3000")
public class LogsController {

    @Autowired
    private LogsRepository logsRepository;

    // GET ALL
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Logs> getAllLogs() {
        return logsRepository.findAll();
    }

    // SEARCH
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public List<Logs> searchLogs(@RequestParam String code) {
        return logsRepository.findByLogCodeContainingIgnoreCase(code);
    }

    // ADD
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addLog(@RequestBody Logs log) {

        if (logsRepository.existsByLogCode(log.getLogCode())) {
            return ResponseEntity.badRequest().body("Log code already exists!");
        }

        logsRepository.save(log);
        return ResponseEntity.ok("Log added successfully!");
    }

    // ADD STOCK
    @PutMapping("/addStock")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> addLogStock(
            @RequestParam String logCode,
            @RequestParam double quantity) {

        Logs log = logsRepository.findByLogCode(logCode);

        if (log == null)
            return ResponseEntity.badRequest().body("Log not found!");

        log.setQuantity(log.getQuantity() + quantity);
        logsRepository.save(log);

        return ResponseEntity.ok("Stock added successfully!");
    }

    // REDUCE STOCK
    @PutMapping("/reduce")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> reduceLogStock(
            @RequestParam String logCode,
            @RequestParam double quantity) {

        Logs log = logsRepository.findByLogCode(logCode);

        if (log == null)
            return ResponseEntity.badRequest().body("Log not found!");

        if (log.getQuantity() < quantity)
            return ResponseEntity.badRequest().body("Not enough stock!");

        log.setQuantity(log.getQuantity() - quantity);
        logsRepository.save(log);

        return ResponseEntity.ok("Stock updated successfully!");
    }

    // ✅ DELETE LOG
    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_OPERATIONS_MANAGER')")
    public ResponseEntity<?> deleteLog(@RequestParam String logCode) {

        Logs log = logsRepository.findByLogCode(logCode);

        if (log == null) {
            return ResponseEntity.badRequest().body("Log not found!");
        }

        logsRepository.deleteByLogCode(logCode);

        return ResponseEntity.ok("Log deleted successfully!");
    }
}