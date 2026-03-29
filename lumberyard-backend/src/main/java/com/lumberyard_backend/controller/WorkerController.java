package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.WorkerDTO;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    /**
     * Get all workers
     * Endpoint: GET /api/workers/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAllWorkers() {
        try {
            List<Worker> workers = workerService.getAllWorkers();
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching workers: " + e.getMessage()));
        }
    }

    /**
     * Get worker by ID
     * Endpoint: GET /api/workers/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getWorkerById(@PathVariable Long id) {
        try {
            Optional<Worker> worker = workerService.getWorkerById(id);
            if (worker.isPresent()) {
                return ResponseEntity.ok(worker.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Worker not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching worker: " + e.getMessage()));
        }
    }

    /**
     * Create a new worker profile
     * Endpoint: POST /api/workers/create
     */
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> createWorker(@RequestBody Worker worker) {
        try {
            Worker createdWorker = workerService.createWorker(worker);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWorker);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error creating worker: " + e.getMessage()));
        }
    }

    /**
     * Add a new worker profile (alternative endpoint for frontend compatibility)
     * Endpoint: POST /api/workers/add
     */
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> addWorker(@RequestBody WorkerDTO workerDTO) {
        try {
            // Convert DTO to Entity
            Worker worker = convertDTOToWorker(workerDTO);
            Worker createdWorker = workerService.createWorker(worker);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWorker);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error creating worker: " + e.getMessage()));
        }
    }

    /**
     * Helper method to convert WorkerDTO to Worker entity
     */
    private Worker convertDTOToWorker(WorkerDTO dto) {
        Worker worker = new Worker();
        
        worker.setFirstName(dto.getFirstName());
        worker.setLastName(dto.getLastName());
        worker.setEmail(dto.getEmail());
        worker.setPhone(dto.getPhone());
        worker.setPosition(dto.getPosition());
        worker.setDepartment(dto.getDepartment());
        
        // Define a default hourly rate since it's not present in DTO
        worker.setHourlyRate(0.0);
        
        // Dates are already LocalDate in DTO
        if (dto.getHireDate() != null) {
            worker.setHireDate(dto.getHireDate());
        }
        if (dto.getDateOfBirth() != null) {
            worker.setDateOfBirth(dto.getDateOfBirth());
        }
        
        worker.setAddress(dto.getAddress());
        worker.setSkills(dto.getSkills());
        worker.setCertifications(dto.getCertifications());
        
        // Set status
        if (dto.getStatus() != null) {
            worker.setStatus(dto.getStatus());
        } else {
            worker.setStatus(Worker.WorkerStatus.ACTIVE);
        }
        
        worker.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true);
        
        return worker;
    }

    /**
     * Update an existing worker profile
     * Endpoint: PUT /api/workers/update/{id}
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> updateWorker(@PathVariable Long id, @RequestBody Worker worker) {
        try {
            Worker updatedWorker = workerService.updateWorker(id, worker);
            return ResponseEntity.ok(updatedWorker);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error updating worker: " + e.getMessage()));
        }
    }

    /**
     * Delete a worker profile (hard delete)
     * Endpoint: DELETE /api/workers/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> deleteWorker(@PathVariable Long id) {
        try {
            workerService.deleteWorker(id);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Cannot delete worker: associated records exist. Please use soft delete instead."));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error deleting worker: " + e.getMessage()));
        }
    }

    /**
     * Soft delete a worker profile (set status to inactive)
     * Endpoint: DELETE /api/workers/soft-delete/{id}
     */
    @DeleteMapping("/soft-delete/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> softDeleteWorker(@PathVariable Long id) {
        try {
            Worker worker = workerService.softDeleteWorker(id);
            return ResponseEntity.ok(worker);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error soft deleting worker: " + e.getMessage()));
        }
    }

    /**
     * Get workers by department
     * Endpoint: GET /api/workers/department/{department}
     */
    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getWorkersByDepartment(@PathVariable String department) {
        try {
            List<Worker> workers = workerService.getWorkersByDepartment(department);
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching workers by department: " + e.getMessage()));
        }
    }

    /**
     * Get workers by status
     * Endpoint: GET /api/workers/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getWorkersByStatus(@PathVariable String status) {
        try {
            Worker.WorkerStatus workerStatus = Worker.WorkerStatus.valueOf(status.toUpperCase());
            List<Worker> workers = workerService.getWorkersByStatus(workerStatus);
            return ResponseEntity.ok(workers);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid status value. Valid values: ACTIVE, INACTIVE, SUSPENDED, TERMINATED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching workers by status: " + e.getMessage()));
        }
    }

    /**
     * Get available workers
     * Endpoint: GET /api/workers/available
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAvailableWorkers() {
        try {
            List<Worker> workers = workerService.getAvailableWorkers();
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching available workers: " + e.getMessage()));
        }
    }

    /**
     * Get worker statistics
     * Endpoint: GET /api/workers/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getWorkerStats() {
        try {
            Object stats = workerService.getWorkerStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching worker stats: " + e.getMessage()));
        }
    }

    // Inner class for error response
    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}
