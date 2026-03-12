package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.User;
import com.lumberyard_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find by email first
        User user = userRepository.findByEmail(username).orElse(null);
        
        // If not found by email, try phone
        if (user == null) {
            user = userRepository.findByPhone(username).orElse(null);
        }
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email or phone: " + username);
        }
        
        return user;
    }
}