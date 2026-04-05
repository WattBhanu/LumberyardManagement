package com.lumberyard_backend.controller;

import com.lumberyard_backend.dto.ShiftDTO;
import com.lumberyard_backend.dto.ShiftScheduleDTO;
import com.lumberyard_backend.dto.ShiftWorkerAssignmentDTO;
import com.lumberyard_backend.entity.JobAssignment;
import com.lumberyard_backend.entity.Shift;
import com.lumberyard_backend.service.ShiftService;
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
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {
    
    @Autowired
    private ShiftService shiftService;
    
    /**
     * Get shift schedule for a specific date
     */
    @GetMapping("/schedule")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getShiftSchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            ShiftScheduleDTO schedule;
            if (date != null) {
                schedule = shiftService.getShiftSchedule(date);
            } else {
                schedule = shiftService.getAllShiftSchedule();
            }
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching shift schedule: " + e.getMessage()));
        }
    }
    
    /**
     * Get all shifts
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAllShifts() {
        try {
            List<ShiftDTO> shifts = shiftService.getAllShifts();
            return ResponseEntity.ok(shifts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching shifts: " + e.getMessage()));
        }
    }
    
    /**
     * Assign worker to shift
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> assignWorkerToShift(
            @RequestParam Long shiftId,
            @RequestParam Long workerId,
            @RequestParam Long jobId) {
        try {
            ShiftWorkerAssignmentDTO assignment = shiftService.assignWorkerToShift(shiftId, workerId, jobId);
            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error assigning worker: " + e.getMessage()));
        }
    }
    
    /**
     * Remove worker from shift
     */
    @DeleteMapping("/remove")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> removeWorkerFromShift(
            @RequestParam Long shiftId,
            @RequestParam Long workerId) {
        try {
            shiftService.removeWorkerFromShift(shiftId, workerId);
            return ResponseEntity.ok(new SuccessResponse("Worker removed from shift successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error removing worker: " + e.getMessage()));
        }
    }
    
    /**
     * Get workers assigned to a shift
     */
    @GetMapping("/{shiftId}/workers")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getWorkersByShift(@PathVariable Long shiftId) {
        try {
            List<ShiftWorkerAssignmentDTO> workers = shiftService.getWorkersByShift(shiftId);
            return ResponseEntity.ok(workers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching workers: " + e.getMessage()));
        }
    }
    
    /**
     * Get shifts for a worker
     */
    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getShiftsByWorker(@PathVariable Long workerId) {
        try {
            List<ShiftWorkerAssignmentDTO> shifts = shiftService.getShiftsByWorker(workerId);
            return ResponseEntity.ok(shifts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching shifts: " + e.getMessage()));
        }
    }
    
    /**
     * Toggle shift active status
     */
    @PutMapping("/{shiftId}/toggle")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> toggleShiftActive(@PathVariable Long shiftId) {
        try {
            Shift shift = shiftService.toggleShiftActive(shiftId);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error toggling shift: " + e.getMessage()));
        }
    }
    
    /**
     * Get expired jobs
     */
    @GetMapping("/history/expired")
    @PreAuthorize("hasAnyRole('LABOR_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getExpiredJobs() {
        try {
            List<JobAssignment> expiredJobs = shiftService.getExpiredJobs();
            return ResponseEntity.ok(expiredJobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching expired jobs: " + e.getMessage()));
        }
    }
    
    /**
     * Delete expired job (Admin only)
     */
    @DeleteMapping("/history/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteExpiredJob(@PathVariable Long jobId) {
        try {
            shiftService.deleteExpiredJob(jobId);
            return ResponseEntity.ok(new SuccessResponse("Expired job deleted successfully"));
        } catch (RuntimeException e) {
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
    }
}
