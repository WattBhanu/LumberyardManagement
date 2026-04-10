package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.ManagerSalaryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManagerSalaryHistoryRepository extends JpaRepository<ManagerSalaryHistory, Long> {
    
    // Find all salary history for a specific manager
    List<ManagerSalaryHistory> findByManager_UserIdOrderByEffectiveDateDesc(Long managerId);
    
    // Find all salary history records
    List<ManagerSalaryHistory> findAllByOrderByCreatedAtDesc();
    
    // Find the latest salary record for a manager
    List<ManagerSalaryHistory> findTopByManager_UserIdOrderByEffectiveDateDesc(Long managerId);
}
