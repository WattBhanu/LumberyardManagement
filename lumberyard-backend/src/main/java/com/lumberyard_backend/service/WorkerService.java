package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.WorkerRepository;
import com.lumberyard_backend.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * Get all workers
     */
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    /**
     * Get worker by ID
     */
    public Optional<Worker> getWorkerById(Long workerId) {
        return workerRepository.findById(workerId);
    }

    /**
     * Create a new worker profile with validation
     */
    public Worker createWorker(Worker worker) {
        // Validate required fields
        validateWorkerData(worker);

        // Check if email already exists
        if (worker.getEmail() != null && workerRepository.existsByEmail(worker.getEmail())) {
            throw new RuntimeException("Worker with email " + worker.getEmail() + " already exists");
        }

        // Check if phone already exists
        if (worker.getPhone() != null && workerRepository.existsByPhone(worker.getPhone())) {
            throw new RuntimeException("Worker with phone " + worker.getPhone() + " already exists");
        }

        // Check if name already exists (to prevent duplicates)
        if (worker.getFirstName() != null && worker.getLastName() != null && 
            workerRepository.existsByFirstNameAndLastName(worker.getFirstName(), worker.getLastName())) {
            throw new RuntimeException("Worker with name " + worker.getFirstName() + " " + worker.getLastName() + " already exists");
        }

        // Set default values
        if (worker.getStatus() == null) {
            worker.setStatus(Worker.WorkerStatus.ACTIVE);
        }
        if (worker.getIsAvailable() == null) {
            worker.setIsAvailable(true);
        }

        return workerRepository.save(worker);
    }

    /**
     * Update an existing worker profile
     */
    public Worker updateWorker(Long workerId, Worker updatedWorker) {
        // Check if worker exists
        Worker existingWorker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));

        // Validate updated data
        validateWorkerData(updatedWorker);

        // Check if email is being changed and if it already exists
        if (updatedWorker.getEmail() != null && 
            !updatedWorker.getEmail().equals(existingWorker.getEmail()) &&
            workerRepository.existsByEmail(updatedWorker.getEmail())) {
            throw new RuntimeException("Worker with email " + updatedWorker.getEmail() + " already exists");
        }

        // Check if phone is being changed and if it already exists
        if (updatedWorker.getPhone() != null && 
            !updatedWorker.getPhone().equals(existingWorker.getPhone()) &&
            workerRepository.existsByPhone(updatedWorker.getPhone())) {
            throw new RuntimeException("Worker with phone " + updatedWorker.getPhone() + " already exists");
        }

        // Update fields
        existingWorker.setFirstName(updatedWorker.getFirstName());
        existingWorker.setLastName(updatedWorker.getLastName());
        existingWorker.setEmail(updatedWorker.getEmail());
        existingWorker.setPhone(updatedWorker.getPhone());
        existingWorker.setPosition(updatedWorker.getPosition());
        existingWorker.setDepartment(updatedWorker.getDepartment());
        existingWorker.setDateOfBirth(updatedWorker.getDateOfBirth());
        existingWorker.setHireDate(updatedWorker.getHireDate());
        existingWorker.setAddress(updatedWorker.getAddress());
        
        // Preserve existing hourly rate if not provided in update
        if (updatedWorker.getHourlyRate() != null) {
            existingWorker.setHourlyRate(updatedWorker.getHourlyRate());
        }
        
        existingWorker.setStatus(updatedWorker.getStatus());
        existingWorker.setSkills(updatedWorker.getSkills());
        existingWorker.setCertifications(updatedWorker.getCertifications());
        
        if (updatedWorker.getIsAvailable() != null) {
            existingWorker.setIsAvailable(updatedWorker.getIsAvailable());
        }

        return workerRepository.save(existingWorker);
    }

    /**
     * Delete a worker profile and associated attendance records
     */
    @Transactional
    public void deleteWorker(Long workerId) {
        if (!workerRepository.existsById(workerId)) {
            throw new RuntimeException("Worker not found with id: " + workerId);
        }
        
        // Delete associated attendance records to prevent foreign key constraint violations
        attendanceRepository.deleteByWorker_WorkerId(workerId);
        
        // Delete the worker
        workerRepository.deleteById(workerId);
    }

    /**
     * Soft delete - set worker status to inactive
     */
    public Worker softDeleteWorker(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));
        
        worker.setStatus(Worker.WorkerStatus.INACTIVE);
        worker.setIsAvailable(false);
        
        return workerRepository.save(worker);
    }

    /**
     * Get workers by department
     */
    public List<Worker> getWorkersByDepartment(String department) {
        return workerRepository.findByDepartment(department);
    }

    /**
     * Get workers by status
     */
    public List<Worker> getWorkersByStatus(Worker.WorkerStatus status) {
        return workerRepository.findByStatus(status);
    }

    /**
     * Get available workers
     */
    public List<Worker> getAvailableWorkers() {
        return workerRepository.findByIsAvailable(true);
    }

    /**
     * Get worker statistics
     */
    public Object getWorkerStats() {
        List<Worker> allWorkers = workerRepository.findAll();
        long totalWorkers = allWorkers.size();
        long activeWorkers = allWorkers.stream()
                .filter(w -> w.getStatus() == Worker.WorkerStatus.ACTIVE)
                .count();
        long inactiveWorkers = allWorkers.stream()
                .filter(w -> w.getStatus() == Worker.WorkerStatus.INACTIVE)
                .count();
        
        // Create a simple response object using Map
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalWorkers", totalWorkers);
        stats.put("activeWorkers", activeWorkers);
        stats.put("inactiveWorkers", inactiveWorkers);
        
        return stats;
    }

    /**
     * Validate worker data
     */
    private void validateWorkerData(Worker worker) {
        // Validate name
        if (worker.getFirstName() == null || worker.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("Worker first name is required");
        }
        if (worker.getLastName() == null || worker.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Worker last name is required");
        }

        // Validate email
        if (worker.getEmail() == null || worker.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Worker email is required");
        }
        if (!isValidEmail(worker.getEmail())) {
            throw new RuntimeException("Invalid email format: " + worker.getEmail());
        }

        // Validate date of birth
        if (worker.getDateOfBirth() == null) {
            throw new RuntimeException("Date of birth is required");
        }
        if (worker.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new RuntimeException("Date of birth cannot be in the future");
        }

        // Validate hire date
        if (worker.getHireDate() == null) {
            throw new RuntimeException("Hire date is required");
        }
        if (worker.getHireDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Hire date cannot be in the future");
        }

        // Validate position
        if (worker.getPosition() == null || worker.getPosition().trim().isEmpty()) {
            throw new RuntimeException("Position is required");
        }

        // Validate department
        if (worker.getDepartment() == null || worker.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }

        // Validate hourly rate removed as per requirements
    }

    /**
     * Simple email validation
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email.matches(emailRegex);
    }
}
