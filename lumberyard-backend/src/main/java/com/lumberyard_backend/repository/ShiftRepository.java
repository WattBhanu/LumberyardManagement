package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    
    List<Shift> findByDate(LocalDate date);
    
    List<Shift> findByDateOrderByStartTimeAsc(LocalDate date);
    
    @Query("SELECT s FROM Shift s ORDER BY s.date ASC, s.startTime ASC")
    List<Shift> findAllOrderByDateAsc();
    
    @Query("SELECT s FROM Shift s WHERE s.date = :date AND s.name = :name")
    Shift findByDateAndName(@Param("date") LocalDate date, @Param("name") String name);
    
    void deleteByDateBefore(LocalDate date);
}
