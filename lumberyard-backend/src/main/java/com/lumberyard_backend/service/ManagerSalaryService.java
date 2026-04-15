package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.ManagerSalaryResponse;
import com.lumberyard_backend.dto.ManagerSalaryUpdateRequest;
import com.lumberyard_backend.entity.ManagerSalaryHistory;
import com.lumberyard_backend.entity.User;
import com.lumberyard_backend.repository.ManagerSalaryHistoryRepository;
import com.lumberyard_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ManagerSalaryService {
    
    @Autowired
    private ManagerSalaryHistoryRepository salaryHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get all managers with their current salary
    public List<ManagerSalaryResponse> getAllManagersWithSalary() {
        List<User> managers = userRepository.findAll();
        List<ManagerSalaryResponse> responses = new ArrayList<>();
        
        for (User manager : managers) {
            // Only include manager roles
            if (isManagerRole(manager.getRole().name())) {
                ManagerSalaryResponse response = new ManagerSalaryResponse();
                response.setManagerId(manager.getUserId());
                response.setManagerName(manager.getName());
                response.setManagerEmail(manager.getEmail());
                response.setManagerRole(manager.getRole().name());
                response.setCurrentDailyRate(manager.getDailySalaryRate());
                
                // Get latest salary history
                List<ManagerSalaryHistory> history = salaryHistoryRepository
                    .findByManager_UserIdOrderByEffectiveDateDesc(manager.getUserId());
                
                if (!history.isEmpty()) {
                    ManagerSalaryHistory latest = history.get(0);
                    response.setId(latest.getId());
                    response.setEffectiveDate(latest.getEffectiveDate());
                    response.setCreatedAt(latest.getCreatedAt());
                    response.setCreatedBy(latest.getCreatedBy());
                    response.setReason(latest.getReason());
                }
                
                responses.add(response);
            }
        }
        
        return responses;
    }
    
    // Update manager salary
    @Transactional
    public ManagerSalaryResponse updateManagerSalary(ManagerSalaryUpdateRequest request, String updatedBy) {
        // Find the manager
        Optional<User> managerOpt = userRepository.findById(request.getManagerId());
        if (managerOpt.isEmpty()) {
            throw new RuntimeException("Manager not found with ID: " + request.getManagerId());
        }
        
        User manager = managerOpt.get();
        Double previousRate = manager.getDailySalaryRate();
        
        // Validate new rate
        if (request.getNewDailyRate() == null || request.getNewDailyRate() <= 0) {
            throw new RuntimeException("Invalid salary rate. Must be greater than 0.");
        }
        
        // Update user's daily salary rate
        manager.setDailySalaryRate(request.getNewDailyRate());
        userRepository.save(manager);
        
        // Create salary history record
        ManagerSalaryHistory history = new ManagerSalaryHistory();
        history.setManager(manager);
        history.setDailyRate(request.getNewDailyRate());
        history.setEffectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : LocalDate.now());
        history.setReason(request.getReason() != null ? request.getReason() : "Salary update");
        history.setCreatedBy(updatedBy);
        
        salaryHistoryRepository.save(history);
        
        // Build response
        ManagerSalaryResponse response = new ManagerSalaryResponse();
        response.setId(history.getId());
        response.setManagerId(manager.getUserId());
        response.setManagerName(manager.getName());
        response.setManagerEmail(manager.getEmail());
        response.setManagerRole(manager.getRole().name());
        response.setPreviousDailyRate(previousRate);
        response.setNewDailyRate(request.getNewDailyRate());
        response.setCurrentDailyRate(request.getNewDailyRate());
        response.setEffectiveDate(history.getEffectiveDate());
        response.setReason(history.getReason());
        response.setCreatedAt(history.getCreatedAt());
        response.setCreatedBy(history.getCreatedBy());
        
        return response;
    }
    
    // Get salary history for a specific manager
    public List<ManagerSalaryResponse> getManagerSalaryHistory(Long managerId) {
        List<ManagerSalaryHistory> historyList = salaryHistoryRepository
            .findByManager_UserIdOrderByEffectiveDateDesc(managerId);
        
        Optional<User> managerOpt = userRepository.findById(managerId);
        if (managerOpt.isEmpty()) {
            throw new RuntimeException("Manager not found with ID: " + managerId);
        }
        
        User manager = managerOpt.get();
        List<ManagerSalaryResponse> responses = new ArrayList<>();
        
        for (ManagerSalaryHistory history : historyList) {
            ManagerSalaryResponse response = new ManagerSalaryResponse();
            response.setId(history.getId());
            response.setManagerId(manager.getUserId());
            response.setManagerName(manager.getName());
            response.setManagerEmail(manager.getEmail());
            response.setManagerRole(manager.getRole().name());
            response.setNewDailyRate(history.getDailyRate());
            response.setEffectiveDate(history.getEffectiveDate());
            response.setReason(history.getReason());
            response.setCreatedAt(history.getCreatedAt());
            response.setCreatedBy(history.getCreatedBy());
            responses.add(response);
        }
        
        return responses;
    }
    
    // Helper method to check if role is a manager role
    private boolean isManagerRole(String roleName) {
        return roleName.equals("ADMIN") || 
               roleName.equals("FINANCE_MANAGER") || 
               roleName.equals("LABOR_MANAGER") || 
               roleName.equals("INVENTORY_OPERATIONS_MANAGER");
    }
}
