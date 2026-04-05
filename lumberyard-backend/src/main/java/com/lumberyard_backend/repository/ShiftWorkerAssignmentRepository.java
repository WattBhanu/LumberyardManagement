package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.ShiftWorkerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftWorkerAssignmentRepository extends JpaRepository<ShiftWorkerAssignment, Long> {
    
    List<ShiftWorkerAssignment> findByShiftId(Long shiftId);
    
    List<ShiftWorkerAssignment> findByJobAssignmentId(Long jobAssignmentId);
    
    List<ShiftWorkerAssignment> findByWorkerWorkerId(Long workerId);
    
    @Query("SELECT swa FROM ShiftWorkerAssignment swa WHERE swa.shift.id = :shiftId AND swa.worker.workerId = :workerId")
    Optional<ShiftWorkerAssignment> findByShiftIdAndWorkerId(@Param("shiftId") Long shiftId, @Param("workerId") Long workerId);
    
    List<ShiftWorkerAssignment> findByJobAssignmentIdAndStatus(Long jobAssignmentId, ShiftWorkerAssignment.AssignmentStatus status);
    
    void deleteByJobAssignmentId(Long jobAssignmentId);
}
