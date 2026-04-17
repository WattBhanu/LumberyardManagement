package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.ManagerAttendance;
import com.lumberyard_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ManagerAttendanceRepository extends JpaRepository<ManagerAttendance, Long> {
    
    List<ManagerAttendance> findByAttendanceDate(LocalDate attendanceDate);
    
    Optional<ManagerAttendance> findByManagerAndAttendanceDate(User manager, LocalDate attendanceDate);
    
    List<ManagerAttendance> findByManager_UserId(Long managerId);
    
    List<ManagerAttendance> findByManager_UserIdAndAttendanceDateBetween(
        Long managerId, LocalDate startDate, LocalDate endDate);
    
    boolean existsByAttendanceDate(LocalDate attendanceDate);
    
    void deleteByAttendanceDate(LocalDate attendanceDate);
    
    @Query("SELECT DISTINCT m.attendanceDate FROM ManagerAttendance m")
    List<LocalDate> findDistinctAttendanceDates();
}
