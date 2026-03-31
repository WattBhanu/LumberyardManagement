package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.JobWorkerAssignment;
import com.lumberyard_backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JobWorkerAssignmentRepository extends JpaRepository<JobWorkerAssignment, Long> {
    
    List<JobWorkerAssignment> findByJobAssignmentId(Long jobAssignmentId);
    
    @Query("SELECT jwa.worker FROM JobWorkerAssignment jwa WHERE jwa.jobAssignment.date = :date")
    List<Worker> findWorkersAssignedToDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(jwa) FROM JobWorkerAssignment jwa WHERE jwa.jobAssignment.id = :jobId AND jwa.position = :position")
    long countByJobIdAndPosition(@Param("jobId") Long jobId, @Param("position") String position);
    
    void deleteByJobAssignmentId(Long jobAssignmentId);
}
