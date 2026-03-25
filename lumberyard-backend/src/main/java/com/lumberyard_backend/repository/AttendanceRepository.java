package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Attendance;
import com.lumberyard_backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByWorker_WorkerIdAndDate(Long workerId, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByWorker_WorkerIdAndDateBetween(Long workerId, LocalDate startDate, LocalDate endDate);
    void deleteByWorker_WorkerId(Long workerId);
}
