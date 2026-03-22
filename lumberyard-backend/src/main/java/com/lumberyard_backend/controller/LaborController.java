package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.WorkerDTO;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/labor")
@CrossOrigin(origins = "*")
public class LaborController {

    @Autowired
    private WorkerService workerService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok("Labor Dashboard Data");
    }

    /**
     * Get all workers - Accessible by Labor Manager and Admin
     * Endpoint: GET /api/labor/workers/all
     */
    @GetMapping("/workers/all")
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
     * Get worker by ID - Accessible by Labor Manager and Admin
     * Endpoint: GET /api/labor/workers/{id}
     */
    @GetMapping("/workers/{id}")
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
     * Create a new worker profile - Accessible by Labor Manager and Admin
     * Endpoint: POST /api/labor/workers/create
     */
    @PostMapping("/workers/create")
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
     * Endpoint: POST /api/labor/workers/add
     */
    @PostMapping("/workers/add")
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
     * Update an existing worker profile - Accessible by Labor Manager and Admin
     * Endpoint: PUT /api/labor/workers/update/{id}
     */
    @PutMapping("/workers/update/{id}")
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
     * Delete a worker profile - Accessible by Labor Manager and Admin
     * Endpoint: DELETE /api/labor/workers/delete/{id}
     */
    @DeleteMapping("/workers/delete/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> deleteWorker(@PathVariable Long id) {
        try {
            workerService.deleteWorker(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
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
     * Soft delete a worker profile - Accessible by Labor Manager and Admin
     * Endpoint: DELETE /api/labor/workers/soft-delete/{id}
     */
    @DeleteMapping("/workers/soft-delete/{id}")
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
     * Get workers by department - Accessible by Labor Manager and Admin
     * Endpoint: GET /api/labor/workers/department/{department}
     */
    @GetMapping("/workers/department/{department}")
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
     * Get available workers - Accessible by Labor Manager and Admin
     * Endpoint: GET /api/labor/workers/available
     */
    @GetMapping("/workers/available")
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