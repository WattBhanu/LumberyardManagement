package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    
    List<FinancialTransaction> findAllByOrderByDateDesc();

    @Query("SELECT SUM(t.amount) FROM FinancialTransaction t")
    Double getTotalRevenue();

    List<FinancialTransaction> findByDateBetweenOrderByDateDesc(java.time.LocalDate startDate, java.time.LocalDate endDate);

    List<FinancialTransaction> findByDateBetweenAndTypeOrderByDateDesc(java.time.LocalDate startDate, java.time.LocalDate endDate, String type);
}
