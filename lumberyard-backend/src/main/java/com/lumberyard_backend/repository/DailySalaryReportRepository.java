package com.lumberyard_backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lumberyard_backend.entity.DailySalaryReport;

@Repository
public interface DailySalaryReportRepository extends JpaRepository<DailySalaryReport, Long> {
    
    List<DailySalaryReport> findByReportDate(LocalDate reportDate);
    
    List<DailySalaryReport> findByReportDateAndStaffType(LocalDate reportDate, String staffType);
    
    @Query("SELECT DISTINCT d.reportDate FROM DailySalaryReport d ORDER BY d.reportDate DESC")
    List<LocalDate> findDistinctReportDates();
    
    @Query("SELECT SUM(d.totalSalary) FROM DailySalaryReport d WHERE d.reportDate = :reportDate")
    BigDecimal getTotalSalaryByDate(@Param("reportDate") LocalDate reportDate);
    
    @Query("SELECT SUM(d.totalSalary) FROM DailySalaryReport d WHERE d.reportDate = :reportDate AND d.staffType = :staffType")
    BigDecimal getTotalSalaryByDateAndType(@Param("reportDate") LocalDate reportDate, @Param("staffType") String staffType);
    
    @Query("SELECT SUM(d.totalSalary) FROM DailySalaryReport d WHERE d.reportDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalSalaryByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<DailySalaryReport> findByReportDateBetweenOrderByReportDateDesc(LocalDate startDate, LocalDate endDate);
    
    boolean existsByReportDate(LocalDate reportDate);
    
    void deleteByReportDate(LocalDate reportDate);
}
