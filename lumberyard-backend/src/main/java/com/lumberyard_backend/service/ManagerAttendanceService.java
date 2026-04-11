package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.ManagerAttendanceDTO;
import com.lumberyard_backend.entity.ManagerAttendance;
import com.lumberyard_backend.entity.User;
import com.lumberyard_backend.repository.ManagerAttendanceRepository;
import com.lumberyard_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ManagerAttendanceService {
    
    @Autowired
    private ManagerAttendanceRepository attendanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get all managers for attendance marking
    public List<ManagerAttendanceDTO> getAllManagersForAttendance() {
        List<User> managers = userRepository.findAll();
        List<ManagerAttendanceDTO> managerDTOs = new ArrayList<>();
        
        for (User manager : managers) {
            if (isManagerRole(manager.getRole().name())) {
                ManagerAttendanceDTO dto = new ManagerAttendanceDTO();
                dto.setManagerId(manager.getUserId());
                dto.setManagerName(manager.getName());
                dto.setManagerRole(manager.getRole().name());
                dto.setIsPresent(null); // Will be set when loading attendance
                managerDTOs.add(dto);
            }
        }
        
        return managerDTOs;
    }
    
    // Get attendance for a specific date
    public List<ManagerAttendanceDTO> getAttendanceForDate(LocalDate date) {
        List<ManagerAttendanceDTO> allManagers = getAllManagersForAttendance();
        List<ManagerAttendance> attendanceRecords = attendanceRepository.findByAttendanceDate(date);
        
        // Mark attendance status
        for (ManagerAttendanceDTO manager : allManagers) {
            Optional<ManagerAttendance> record = attendanceRecords.stream()
                .filter(a -> a.getManager().getUserId().equals(manager.getManagerId()))
                .findFirst();
            
            if (record.isPresent()) {
                manager.setIsPresent(record.get().getIsPresent());
            } else {
                manager.setIsPresent(null); // Not marked yet
            }
        }
        
        return allManagers;
    }
    
    // Mark attendance for multiple managers
    @Transactional
    public List<ManagerAttendanceDTO> markAttendance(
            List<ManagerAttendanceDTO> attendanceList, 
            LocalDate date, 
            String markedBy) {
        
        List<ManagerAttendanceDTO> savedRecords = new ArrayList<>();
        
        for (ManagerAttendanceDTO dto : attendanceList) {
            Optional<User> managerOpt = userRepository.findById(dto.getManagerId());
            if (managerOpt.isPresent()) {
                User manager = managerOpt.get();
                
                // Check if attendance already exists for this manager on this date
                Optional<ManagerAttendance> existingRecord = 
                    attendanceRepository.findByManagerAndAttendanceDate(manager, date);
                
                ManagerAttendance attendance;
                if (existingRecord.isPresent()) {
                    attendance = existingRecord.get();
                    attendance.setIsPresent(dto.getIsPresent());
                    attendance.setMarkedBy(markedBy);
                } else {
                    attendance = new ManagerAttendance();
                    attendance.setManager(manager);
                    attendance.setAttendanceDate(date);
                    attendance.setIsPresent(dto.getIsPresent());
                    attendance.setMarkedBy(markedBy);
                }
                
                ManagerAttendance saved = attendanceRepository.save(attendance);
                
                // Convert to DTO
                ManagerAttendanceDTO savedDto = new ManagerAttendanceDTO();
                savedDto.setManagerId(manager.getUserId());
                savedDto.setManagerName(manager.getName());
                savedDto.setManagerRole(manager.getRole().name());
                savedDto.setIsPresent(saved.getIsPresent());
                
                savedRecords.add(savedDto);
            }
        }
        
        return savedRecords;
    }
    
    // Check if attendance is already marked for a date
    public boolean isAttendanceMarked(LocalDate date) {
        return attendanceRepository.existsByAttendanceDate(date);
    }
    
    // Helper method to check if role is a manager role
    private boolean isManagerRole(String role) {
        return role.equals("ADMIN") || 
               role.equals("FINANCE_MANAGER") || 
               role.equals("LABOR_MANAGER") || 
               role.equals("INVENTORY_OPERATIONS_MANAGER");
    }
}
