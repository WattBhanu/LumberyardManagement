package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.*;
import com.lumberyard_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(String name, String email, String phone, String password, Role role) {
        // Check if user with email or phone already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }
        
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new RuntimeException("User with phone " + phone + " already exists");
        }

        User user;
        switch (role) {
            case ADMIN:
                user = new Admin();
                break;
            case INVENTORY_OPERATIONS_MANAGER:
                user = new InventoryOperationsManager();
                break;
            case LABOR_MANAGER:
                user = new LaborManager();
                break;
            case FINANCE_MANAGER:
                user = new FinanceManager();
                break;
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }

        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password)); // Encrypt the password
        user.setRole(role);
        user.setStatus(true); // Set status to active by default

        return userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
}