package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.JobAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobAssignmentRepository extends JpaRepository<JobAssignment, Long> {
    
    Optional<JobAssignment> findByJobId(String jobId);
    
    List<JobAssignment> findByDate(LocalDate date);
    
    List<JobAssignment> findByStatus(JobAssignment.JobStatus status);
    
    // Get all jobs for a date - filtering will be done in service layer
    List<JobAssignment> findByDateOrderByJobId(LocalDate date);
    
    boolean existsByJobId(String jobId);
}
