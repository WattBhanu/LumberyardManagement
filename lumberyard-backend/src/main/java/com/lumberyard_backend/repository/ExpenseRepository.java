package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findAllByOrderByDateDesc();

    @Query("SELECT SUM(e.amount) FROM Expense e")
    Double getTotalExpenses();

    List<Expense> findByDateBetweenOrderByDateDesc(java.time.LocalDate startDate, java.time.LocalDate endDate);

    List<Expense> findByDateBetweenAndCategoryOrderByDateDesc(java.time.LocalDate startDate, java.time.LocalDate endDate, String category);
}
