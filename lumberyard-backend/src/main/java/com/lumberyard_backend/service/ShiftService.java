package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.ShiftDTO;
import com.lumberyard_backend.dto.ShiftScheduleDTO;
import com.lumberyard_backend.dto.ShiftWorkerAssignmentDTO;
import com.lumberyard_backend.entity.JobAssignment;
import com.lumberyard_backend.entity.Shift;
import com.lumberyard_backend.entity.ShiftWorkerAssignment;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.JobAssignmentRepository;
import com.lumberyard_backend.repository.ShiftRepository;
import com.lumberyard_backend.repository.ShiftWorkerAssignmentRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShiftService {
    
    @Autowired
    private ShiftRepository shiftRepository;
    
    @Autowired
    private ShiftWorkerAssignmentRepository shiftWorkerAssignmentRepository;
    
    @Autowired
    private JobAssignmentRepository jobAssignmentRepository;
    
    @Autowired
    private WorkerRepository workerRepository;
    
    /**
     * Initialize default shifts for a date if they don't exist
     */
    @Transactional
    public List<Shift> initializeDefaultShifts(LocalDate date) {
        List<Shift> existingShifts = shiftRepository.findByDate(date);
        
        if (existingShifts.isEmpty()) {
            // Create default shifts
            List<Shift> defaultShifts = Arrays.asList(
                createShift("MORNING", LocalTime.of(8, 0), LocalTime.of(12, 0), date),
                createShift("EVENING", LocalTime.of(13, 0), LocalTime.of(17, 0), date),
                createShift("NIGHT", LocalTime.of(19, 0), LocalTime.of(23, 59), date)
            );
            return shiftRepository.saveAll(defaultShifts);
        }
        
        return existingShifts;
    }
    
    private Shift createShift(String name, LocalTime start, LocalTime end, LocalDate date) {
        Shift shift = new Shift();
        shift.setName(name);
        shift.setStartTime(start);
        shift.setEndTime(end);
        shift.setDate(date);
        return shift;
    }
    
    /**
     * Get shift schedule for a specific date
     */
    public ShiftScheduleDTO getShiftSchedule(LocalDate date) {
        initializeDefaultShifts(date);
        
        List<Shift> shifts = shiftRepository.findByDateOrderByStartTimeAsc(date);
        List<JobAssignment> jobs = jobAssignmentRepository.findByDate(date);
        
        // Initialize lazy-loaded worker assignments for each job
        jobs.forEach(job -> {
            if (job.getWorkerAssignments() != null) {
                job.getWorkerAssignments().size();
            }
        });
        
        ShiftScheduleDTO schedule = new ShiftScheduleDTO();
        schedule.setDate(date);
        schedule.setShifts(shifts.stream().map(this::convertToShiftDTO).collect(Collectors.toList()));
        schedule.setJobs(jobs.stream().map(this::convertToJobDTO).collect(Collectors.toList()));
        
        return schedule;
    }
    
    /**
     * Get all shifts and jobs (for viewing all dates)
     * Only returns jobs from today onwards (filters out expired jobs)
     */
    public ShiftScheduleDTO getAllShiftSchedule() {
        List<Shift> shifts = shiftRepository.findAllOrderByDateAsc();
        // Fetch all jobs and initialize worker assignments
        List<JobAssignment> allJobs = jobAssignmentRepository.findAll();
        
        // Filter out expired jobs (only keep today and future jobs)
        LocalDate today = LocalDate.now();
        List<JobAssignment> activeJobs = allJobs.stream()
                .filter(job -> !job.getDate().isBefore(today))
                .collect(Collectors.toList());
        
        // Initialize lazy-loaded worker assignments for each job
        activeJobs.forEach(job -> {
            // Force initialization of lazy collection
            if (job.getWorkerAssignments() != null) {
                job.getWorkerAssignments().size();
            }
        });
        
        ShiftScheduleDTO schedule = new ShiftScheduleDTO();
        schedule.setDate(null); // Indicates all dates
        schedule.setShifts(shifts.stream().map(this::convertToShiftDTO).collect(Collectors.toList()));
        schedule.setJobs(activeJobs.stream().map(this::convertToJobDTO).collect(Collectors.toList()));
        
        return schedule;
    }
    
    /**
     * Get all shifts with workers assigned
     */
    public List<ShiftDTO> getAllShifts() {
        List<Shift> shifts = shiftRepository.findAll();
        return shifts.stream().map(this::convertToShiftDTO).collect(Collectors.toList());
    }
    
    /**
     * Assign worker to a shift
     */
    @Transactional
    public ShiftWorkerAssignmentDTO assignWorkerToShift(Long shiftId, Long workerId, Long jobAssignmentId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        
        JobAssignment job = jobAssignmentRepository.findById(jobAssignmentId)
                .orElseThrow(() -> new RuntimeException("Job assignment not found"));
        
        // Check if already assigned
        Optional<ShiftWorkerAssignment> existing = shiftWorkerAssignmentRepository
                .findByShiftIdAndWorkerId(shiftId, workerId);
        
        if (existing.isPresent()) {
            throw new RuntimeException("Worker already assigned to this shift");
        }
        
        ShiftWorkerAssignment assignment = new ShiftWorkerAssignment();
        assignment.setShift(shift);
        assignment.setWorker(worker);
        assignment.setJobAssignment(job);
        assignment.setStatus(ShiftWorkerAssignment.AssignmentStatus.ASSIGNED);
        
        ShiftWorkerAssignment saved = shiftWorkerAssignmentRepository.save(assignment);
        return convertToShiftWorkerAssignmentDTO(saved);
    }
    
    /**
     * Remove worker from shift
     */
    @Transactional
    public void removeWorkerFromShift(Long shiftId, Long workerId) {
        Optional<ShiftWorkerAssignment> assignment = shiftWorkerAssignmentRepository
                .findByShiftIdAndWorkerId(shiftId, workerId);
        
        if (assignment.isPresent()) {
            shiftWorkerAssignmentRepository.delete(assignment.get());
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }
    
    /**
     * Get workers by shift
     */
    public List<ShiftWorkerAssignmentDTO> getWorkersByShift(Long shiftId) {
        List<ShiftWorkerAssignment> assignments = shiftWorkerAssignmentRepository.findByShiftId(shiftId);
        return assignments.stream().map(this::convertToShiftWorkerAssignmentDTO).collect(Collectors.toList());
    }
    
    /**
     * Get shifts by worker
     */
    public List<ShiftWorkerAssignmentDTO> getShiftsByWorker(Long workerId) {
        List<ShiftWorkerAssignment> assignments = shiftWorkerAssignmentRepository.findByWorkerWorkerId(workerId);
        return assignments.stream().map(this::convertToShiftWorkerAssignmentDTO).collect(Collectors.toList());
    }
    
    /**
     * Toggle shift active/inactive
     */
    @Transactional
    public Shift toggleShiftActive(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        
        // For now, we'll use the shift as always active
        // In future, could add an 'active' field
        return shift;
    }
    
    /**
     * Get expired jobs (jobs with date in the past)
     */
    public List<JobAssignment> getExpiredJobs() {
        LocalDate today = LocalDate.now();
        List<JobAssignment> allJobs = jobAssignmentRepository.findAll();
        
        return allJobs.stream()
                .filter(job -> job.getDate().isBefore(today))
                .collect(Collectors.toList());
    }
    
    /**
     * Delete expired job and its assignments
     */
    @Transactional
    public void deleteExpiredJob(Long jobId) {
        JobAssignment job = jobAssignmentRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Delete shift assignments first
        shiftWorkerAssignmentRepository.deleteByJobAssignmentId(jobId);
        
        // Delete the job
        jobAssignmentRepository.delete(job);
    }
    
    /**
     * Convert entity to DTO
     */
    private ShiftDTO convertToShiftDTO(Shift shift) {
        ShiftDTO dto = new ShiftDTO();
        dto.setId(shift.getId());
        dto.setName(shift.getName());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setDate(shift.getDate());
        
        List<ShiftWorkerAssignmentDTO> workerAssignments = shift.getWorkerAssignments().stream()
                .map(this::convertToShiftWorkerAssignmentDTO)
                .collect(Collectors.toList());
        
        dto.setWorkerAssignments(workerAssignments);
        dto.setTotalWorkers(workerAssignments.size());
        
        return dto;
    }
    
    /**
     * Convert entity to DTO
     */
    private ShiftWorkerAssignmentDTO convertToShiftWorkerAssignmentDTO(ShiftWorkerAssignment assignment) {
        ShiftWorkerAssignmentDTO dto = new ShiftWorkerAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setShiftId(assignment.getShift().getId());
        dto.setShiftName(assignment.getShift().getName());
        dto.setWorkerId(assignment.getWorker().getWorkerId());
        dto.setWorkerName(assignment.getWorker().getFirstName() + " " + assignment.getWorker().getLastName());
        dto.setWorkerPosition(assignment.getWorker().getPosition());
        dto.setJobAssignmentId(assignment.getJobAssignment().getId());
        dto.setJobName(assignment.getJobAssignment().getJobName());
        dto.setDate(assignment.getShift().getDate()); // Get date from shift
        dto.setStatus(assignment.getStatus().name());
        return dto;
    }
    
    /**
     * Convert entity to DTO (reuse JobAssignmentDTO logic)
     */
    private com.lumberyard_backend.dto.JobAssignmentDTO convertToJobDTO(JobAssignment job) {
        // Reuse the converter from JobAssignmentService
        com.lumberyard_backend.dto.JobAssignmentDTO dto = new com.lumberyard_backend.dto.JobAssignmentDTO();
        dto.setId(job.getId());
        dto.setJobId(job.getJobId());
        dto.setJobName(job.getJobName());
        dto.setDate(job.getDate());
        dto.setRequiredEmployees(job.getRequiredEmployees());
        dto.setRequiredSupervisors(job.getRequiredSupervisors());
        dto.setStatus(job.getStatus().name());
        dto.setPositionRequirements(job.getPositionRequirements());
        
        // Count assigned workers by position and collect worker details
        java.util.Map<String, Long> assignedPositionsCount = new java.util.HashMap<>();
        java.util.List<com.lumberyard_backend.dto.AssignedWorkerDTO> assignedWorkers = new java.util.ArrayList<>();
        
        if (job.getWorkerAssignments() != null) {
            for (com.lumberyard_backend.entity.JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                String position = assignment.getWorker().getPosition();
                if (position != null) {
                    assignedPositionsCount.put(position, 
                        assignedPositionsCount.getOrDefault(position, 0L) + 1);
                }
                
                // Create worker DTO
                com.lumberyard_backend.dto.AssignedWorkerDTO workerDTO = new com.lumberyard_backend.dto.AssignedWorkerDTO();
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
            for (com.lumberyard_backend.entity.JobWorkerAssignment assignment : job.getWorkerAssignments()) {
                if (assignment.getRole() == com.lumberyard_backend.entity.JobWorkerAssignment.WorkerRole.EMPLOYEE) {
                    employeeCount++;
                } else if (assignment.getRole() == com.lumberyard_backend.entity.JobWorkerAssignment.WorkerRole.SUPERVISOR) {
                    supervisorCount++;
                }
            }
        }
        
        dto.setAssignedEmployeesCount(employeeCount);
        dto.setAssignedSupervisorsCount(supervisorCount);
        
        return dto;
    }
}
