package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.JobAssignmentDTO;
import com.lumberyard_backend.dto.JobCreateDTO;
import com.lumberyard_backend.dto.JobUpdateDTO;
import com.lumberyard_backend.dto.WorkerAssignmentDTO;
import com.lumberyard_backend.entity.JobAssignment;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.service.JobAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobAssignmentController {
    
    @Autowired
    private JobAssignmentService jobAssignmentService;
    
    /**
     * Create a new job
     * POST /api/jobs
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> createJob(@RequestBody JobCreateDTO dto) {
        try {
            JobAssignment job = jobAssignmentService.createJob(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(job);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error creating job: " + e.getMessage()));
        }
    }
    
    /**
     * Get all jobs
     * GET /api/jobs
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAllJobs() {
        try {
            List<JobAssignmentDTO> jobs = jobAssignmentService.getAllJobs();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching jobs: " + e.getMessage()));
        }
    }
    
    /**
     * Get jobs by date
     * GET /api/jobs/date?date=YYYY-MM-DD
     */
    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getJobsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<JobAssignmentDTO> jobs = jobAssignmentService.getJobsByDate(date);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching jobs: " + e.getMessage()));
        }
    }
    
    /**
     * Get jobs that need workers (not fully assigned)
     * GET /api/jobs/unassigned?date=YYYY-MM-DD
     */
    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getUnassignedJobs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<JobAssignmentDTO> jobs = jobAssignmentService.getUnassignedJobs(date);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching unassigned jobs: " + e.getMessage()));
        }
    }
    
    /**
     * Assign workers to a job
     * POST /api/jobs/assign
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> assignWorkers(@RequestBody WorkerAssignmentDTO dto) {
        try {
            JobAssignmentDTO job = jobAssignmentService.assignWorkers(dto);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error assigning workers: " + e.getMessage()));
        }
    }
    
    /**
     * Get available workers for a date
     * GET /api/workers/available?date=YYYY-MM-DD
     */
    @GetMapping("/workers/available")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAvailableWorkers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<Worker> workers = jobAssignmentService.getAvailableWorkers(date);
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching available workers: " + e.getMessage()));
        }
    }
    
    /**
     * Get job details
     * GET /api/jobs/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getJobDetails(@PathVariable Long id) {
        try {
            JobAssignmentDTO job = jobAssignmentService.getJobDetails(id);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching job details: " + e.getMessage()));
        }
    }
    
    /**
     * Update a job
     * PUT /api/jobs/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobUpdateDTO dto) {
        try {
            JobAssignmentDTO job = jobAssignmentService.updateJob(id, dto);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error updating job: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a job
     * DELETE /api/jobs/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            jobAssignmentService.deleteJob(id);
            return ResponseEntity.ok(new SuccessResponse("Job deleted successfully"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error deleting job: " + e.getMessage()));
        }
    }
    
    // Error response inner class
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
    
    // Success response inner class
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
