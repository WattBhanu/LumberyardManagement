package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.AssignedWorkerDTO;
import com.lumberyard_backend.dto.JobAssignmentDTO;
import com.lumberyard_backend.dto.JobCreateDTO;
import com.lumberyard_backend.dto.JobUpdateDTO;
import com.lumberyard_backend.dto.WorkerAssignmentDTO;
import com.lumberyard_backend.entity.JobAssignment;
import com.lumberyard_backend.entity.JobWorkerAssignment;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.JobAssignmentRepository;
import com.lumberyard_backend.repository.JobWorkerAssignmentRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JobAssignmentService {
    
    @Autowired
    private JobAssignmentRepository jobAssignmentRepository;
    
    @Autowired
    private JobWorkerAssignmentRepository jobWorkerAssignmentRepository;
    
    @Autowired
    private WorkerRepository workerRepository;
    
    /**
     * Create a new job assignment
     */
    @Transactional
    public JobAssignment createJob(JobCreateDTO dto) {
        // Check if job ID already exists
        if (jobAssignmentRepository.existsByJobId(dto.getJobId())) {
            throw new RuntimeException("Job ID " + dto.getJobId() + " already exists");
        }
        
        JobAssignment job = new JobAssignment();
        job.setJobId(dto.getJobId());
        job.setJobName(dto.getCustomJobName() != null ? dto.getCustomJobName() : dto.getJobName());
        job.setDate(dto.getDate());
        
        // Support both old and new formats
        if (dto.getPositionRequirements() != null && !dto.getPositionRequirements().isEmpty()) {
            // New position-based format
            job.setPositionRequirements(dto.getPositionRequirements());
            job.setRequiredEmployees(0); // Not using the old format
            job.setRequiredSupervisors(0); // Not using the old format
        } else {
            // Legacy format (employees/supervisors)
            job.setRequiredEmployees(dto.getEmployees() != null ? dto.getEmployees() : 0);
            job.setRequiredSupervisors(dto.getSupervisors() != null ? dto.getSupervisors() : 0);
        }
        
        job.setStatus(JobAssignment.JobStatus.PENDING);
        
        return jobAssignmentRepository.save(job);
    }
    
    /**
     * Get all job assignments
     */
    public List<JobAssignmentDTO> getAllJobs() {
        List<JobAssignment> jobs = jobAssignmentRepository.findAll();
        return jobs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get jobs by date
     */
    public List<JobAssignmentDTO> getJobsByDate(LocalDate date) {
        List<JobAssignment> jobs = jobAssignmentRepository.findByDate(date);
        return jobs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get jobs that need workers (not fully assigned)
     */
    public List<JobAssignmentDTO> getUnassignedJobs(LocalDate date) {
        List<JobAssignment> allJobs = jobAssignmentRepository.findByDateOrderByJobId(date);
        
        // Filter jobs that need workers
        return allJobs.stream()
            .filter(this::jobNeedsWorkers)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Check if a job needs more workers
     */
    private boolean jobNeedsWorkers(JobAssignment job) {
        // Check if using position-based requirements
        if (job.getPositionRequirements() != null && !job.getPositionRequirements().isEmpty()) {
            // Count total required positions
            int totalRequired = job.getPositionRequirements().values().stream()
                .mapToInt(Integer::intValue)
                .sum();
            
            // Count assigned workers
            long totalAssigned = job.getWorkerAssignments() != null ? 
                job.getWorkerAssignments().size() : 0;
            
            return totalAssigned < totalRequired;
        } else {
            // Legacy: Check employee/supervisor counts
            long totalAssigned = job.getWorkerAssignments() != null ? job.getWorkerAssignments().size() : 0;
            int totalRequired = (job.getRequiredEmployees() != null ? job.getRequiredEmployees() : 0) + 
                               (job.getRequiredSupervisors() != null ? job.getRequiredSupervisors() : 0);
            
            return totalAssigned < totalRequired;
        }
    }
    
    /**
     * Assign workers to a job
     */
    @Transactional
    public JobAssignmentDTO assignWorkers(WorkerAssignmentDTO dto) {
        JobAssignment job = jobAssignmentRepository.findById(dto.getJobAssignmentId())
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + dto.getJobAssignmentId()));
        
        // Get the position from the DTO (e.g., "Sawyer", "Team Lead", etc.)
        String position = dto.getRole();
        
        for (Long workerId : dto.getWorkerIds()) {
            Worker worker = workerRepository.findById(workerId)
                    .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));
            
            // Check if worker is already assigned on this date
            List<Worker> assignedWorkers = jobWorkerAssignmentRepository.findWorkersAssignedToDate(job.getDate());
            if (assignedWorkers.contains(worker)) {
                throw new RuntimeException("Worker " + worker.getFirstName() + " " + 
                    worker.getLastName() + " is already assigned to a job on " + job.getDate());
            }
            
            JobWorkerAssignment assignment = new JobWorkerAssignment();
            assignment.setJobAssignment(job);
            assignment.setWorker(worker);
            assignment.setPosition(position); // Store actual position
            
            // For backward compatibility, map common positions to legacy roles
            if ("Supervisor".equalsIgnoreCase(position) || "Team Lead".equalsIgnoreCase(position)) {
                assignment.setRole(JobWorkerAssignment.WorkerRole.SUPERVISOR);
            } else {
                assignment.setRole(JobWorkerAssignment.WorkerRole.EMPLOYEE);
            }
            
            jobWorkerAssignmentRepository.save(assignment);
        }
        
        // Update job status if all workers are assigned
        updateJobStatus(job);
        
        return convertToDTO(job);
    }
    
    /**
     * Get available workers for a specific date (workers without job assignments)
     */
    public List<Worker> getAvailableWorkers(LocalDate date) {
        List<Worker> allActiveWorkers = workerRepository.findByStatus(Worker.WorkerStatus.ACTIVE);
        List<Worker> assignedWorkers = jobWorkerAssignmentRepository.findWorkersAssignedToDate(date);
        
        return allActiveWorkers.stream()
                .filter(w -> !assignedWorkers.contains(w))
                .collect(Collectors.toList());
    }
    
    /**
     * Get assignment details for a specific job
     */
    public JobAssignmentDTO getJobDetails(Long jobId) {
        JobAssignment job = jobAssignmentRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        return convertToDTO(job);
    }
    
    /**
     * Update an existing job
     */
    @Transactional
    public JobAssignmentDTO updateJob(Long jobId, JobUpdateDTO dto) {
        JobAssignment job = jobAssignmentRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        // Update fields if provided
        if (dto.getJobName() != null) {
            job.setJobName(dto.getJobName());
        }
        
        if (dto.getDate() != null) {
            job.setDate(dto.getDate());
        }
        
        if (dto.getStatus() != null) {
            try {
                job.setStatus(JobAssignment.JobStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + dto.getStatus());
            }
        }
        
        // Support both old and new formats
        if (dto.getPositionRequirements() != null && !dto.getPositionRequirements().isEmpty()) {
            // New position-based format
            job.setPositionRequirements(dto.getPositionRequirements());
            job.setRequiredEmployees(0);
            job.setRequiredSupervisors(0);
            
            job = jobAssignmentRepository.save(job);
            
            // Remove excess workers if position requirements were reduced
            removeExcessWorkers(job, dto.getPositionRequirements());
            
            return convertToDTO(job);
        } else {
            // Legacy format (employees/supervisors)
            if (dto.getRequiredEmployees() != null) {
                job.setRequiredEmployees(dto.getRequiredEmployees());
            }
            if (dto.getRequiredSupervisors() != null) {
                job.setRequiredSupervisors(dto.getRequiredSupervisors());
            }
        }
        
        job = jobAssignmentRepository.save(job);
        return convertToDTO(job);
    }
    
    /**
     * Remove workers assigned to positions that have been reduced or removed
     */
    private void removeExcessWorkers(JobAssignment job, Map<String, Integer> newRequirements) {
        if (job.getWorkerAssignments() == null || job.getWorkerAssignments().isEmpty()) {
            return;
        }
        
        // Count workers per position
        Map<String, List<JobWorkerAssignment>> workersByPosition = new HashMap<>();
        for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
            String position = assignment.getPosition() != null ? 
                assignment.getPosition() : assignment.getWorker().getPosition();
            
            if (position != null) {
                workersByPosition.computeIfAbsent(position, k -> new ArrayList<>()).add(assignment);
            }
        }
        
        // Check each position and remove excess workers
        List<JobWorkerAssignment> assignmentsToRemove = new ArrayList<>();
        
        for (Map.Entry<String, List<JobWorkerAssignment>> entry : workersByPosition.entrySet()) {
            String position = entry.getKey();
            List<JobWorkerAssignment> assignedWorkers = entry.getValue();
            int requiredCount = newRequirements.getOrDefault(position, 0);
            
            // If more workers assigned than needed, remove the excess
            if (assignedWorkers.size() > requiredCount) {
                int excessCount = assignedWorkers.size() - requiredCount;
                
                // Remove the last assigned workers (most recently added)
                for (int i = 0; i < excessCount; i++) {
                    int index = assignedWorkers.size() - 1 - i;
                    if (index >= 0) {
                        assignmentsToRemove.add(assignedWorkers.get(index));
                    }
                }
            }
        }
        
        // Remove the excess assignments
        for (JobWorkerAssignment assignment : assignmentsToRemove) {
            job.getWorkerAssignments().remove(assignment);
            jobWorkerAssignmentRepository.delete(assignment);
            System.out.println("Removed worker " + assignment.getWorker().getFirstName() + " " + 
                assignment.getWorker().getLastName() + " from position " + assignment.getPosition() + 
                " due to reduced requirements");
        }
    }
    
    /**
     * Delete a job and free all assigned workers
     */
    @Transactional
    public void deleteJob(Long jobId) {
        JobAssignment job = jobAssignmentRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        
        // Free all assigned workers by deleting their assignments
        if (job.getWorkerAssignments() != null && !job.getWorkerAssignments().isEmpty()) {
            System.out.println("Deleting job " + job.getJobName() + " with " + 
                job.getWorkerAssignments().size() + " assigned workers. Freeing all workers...");
            
            // Delete all worker assignments (this will free the workers)
            for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                System.out.println("Freeing worker: " + assignment.getWorker().getFirstName() + " " + 
                    assignment.getWorker().getLastName() + " from position: " + assignment.getPosition());
            }
            
            // Delete all assignments for this job
            jobWorkerAssignmentRepository.deleteByJobAssignmentId(job.getId());
        }
        
        // Delete the job
        jobAssignmentRepository.delete(job);
        System.out.println("Job deleted successfully: " + job.getJobName());
    }
    
    /**
     * Update job status based on worker assignments
     */
    private void updateJobStatus(JobAssignment job) {
        boolean isFullyAssigned = false;
        
        // Check if using position-based requirements
        if (job.getPositionRequirements() != null && !job.getPositionRequirements().isEmpty()) {
            // Count assigned workers per position
            Map<String, Long> assignedPerPosition = new HashMap<>();
            for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                String position = assignment.getWorker().getPosition();
                if (position != null) {
                    assignedPerPosition.put(position, 
                        assignedPerPosition.getOrDefault(position, 0L) + 1);
                }
            }
            
            // Check if all position requirements are met
            isFullyAssigned = true;
            for (Map.Entry<String, Integer> entry : job.getPositionRequirements().entrySet()) {
                String position = entry.getKey();
                int required = entry.getValue();
                long assigned = assignedPerPosition.getOrDefault(position, 0L);
                if (assigned < required) {
                    isFullyAssigned = false;
                    break;
                }
            }
        } else {
            // Legacy: Check employee/supervisor counts
            long totalAssigned = job.getWorkerAssignments() != null ? job.getWorkerAssignments().size() : 0;
            int totalRequired = (job.getRequiredEmployees() != null ? job.getRequiredEmployees() : 0) + 
                               (job.getRequiredSupervisors() != null ? job.getRequiredSupervisors() : 0);
            
            isFullyAssigned = totalAssigned >= totalRequired;
        }
        
        if (isFullyAssigned) {
            job.setStatus(JobAssignment.JobStatus.IN_PROGRESS);
        } else {
            job.setStatus(JobAssignment.JobStatus.PENDING);
        }
        
        jobAssignmentRepository.save(job);
    }
    
    /**
     * Convert entity to DTO
     */
    private JobAssignmentDTO convertToDTO(JobAssignment job) {
        JobAssignmentDTO dto = new JobAssignmentDTO();
        dto.setId(job.getId());
        dto.setJobId(job.getJobId());
        dto.setJobName(job.getJobName());
        dto.setDate(job.getDate());
        dto.setRequiredEmployees(job.getRequiredEmployees());
        dto.setRequiredSupervisors(job.getRequiredSupervisors());
        dto.setStatus(job.getStatus().name());
        dto.setPositionRequirements(job.getPositionRequirements());
        
        // Count assigned workers by position and collect worker details
        Map<String, Long> assignedPositionsCount = new HashMap<>();
        List<AssignedWorkerDTO> assignedWorkers = new ArrayList<>();
        
        if (job.getWorkerAssignments() != null) {
            for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                String position = assignment.getWorker().getPosition();
                if (position != null) {
                    assignedPositionsCount.put(position, 
                        assignedPositionsCount.getOrDefault(position, 0L) + 1);
                }
                
                // Create worker DTO
                AssignedWorkerDTO workerDTO = new AssignedWorkerDTO();
                workerDTO.setId(assignment.getId());
                workerDTO.setWorkerId(assignment.getWorker().getWorkerId());
                workerDTO.setWorkerName(assignment.getWorker().getFirstName() + " " + assignment.getWorker().getLastName());
                workerDTO.setPosition(assignment.getPosition() != null ? assignment.getPosition() : assignment.getWorker().getPosition());
                workerDTO.setRole(assignment.getPosition() != null ? assignment.getPosition() : (assignment.getRole() != null ? assignment.getRole().name() : "EMPLOYEE"));
                assignedWorkers.add(workerDTO);
            }
        }
        dto.setAssignedPositionsCount(assignedPositionsCount);
        dto.setAssignedWorkers(assignedWorkers);
        
        // Legacy counts for backward compatibility
        long employeeCount = 0;
        long supervisorCount = 0;
        
        if (job.getWorkerAssignments() != null) {
            for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                if (assignment.getRole() == JobWorkerAssignment.WorkerRole.EMPLOYEE) {
                    employeeCount++;
                } else if (assignment.getRole() == JobWorkerAssignment.WorkerRole.SUPERVISOR) {
                    supervisorCount++;
                }
            }
        }
        
        dto.setAssignedEmployeesCount(employeeCount);
        dto.setAssignedSupervisorsCount(supervisorCount);
        
        return dto;
    }
}
