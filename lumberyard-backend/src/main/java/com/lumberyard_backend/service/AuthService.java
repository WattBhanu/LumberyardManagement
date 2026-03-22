package com.lumberyard_backend.service;

import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lumberyard_backend.entity.User;
import com.lumberyard_backend.model.AuthRequest;
import com.lumberyard_backend.model.AuthResponse;
import com.lumberyard_backend.repository.UserRepository;
import com.lumberyard_backend.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10,15}$"); // Basic phone validation

    public AuthResponse authenticate(AuthRequest authRequest) throws Exception {
        String username = authRequest.getUsername();
        String password = authRequest.getPassword();

        // Validate input
        if (username == null || password == null) {
            throw new BadCredentialsException("Username and password required");
        }

        // Determine if the input is email, phone, or username
        User user = null;
        
        if (isEmail(username)) {
            user = userRepository.findByEmail(username).orElse(null);
        } else if (isPhone(username)) {
            user = userRepository.findByPhone(username).orElse(null);
        } else {
            // Treat as username (could be email format but not valid email)
            user = userRepository.findByName(username).orElse(null);
        }

        if (user == null) {
            throw new BadCredentialsException("User not found with provided credentials");
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new DisabledException("User account is disabled");
        }

        // Authenticate using Spring Security
        authenticateUser(user.getEmail(), password);

        // Generate JWT token
        final String token = jwtUtil.generateToken(user);

        return new AuthResponse(
            token,
            user.getEmail(), // Using email as the primary identifier
            user.getName(),
            user.getRole(),
            "Login successful"
        );
    }

    private void authenticateUser(String email, String password) throws Exception {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    email, // Use email as principal for Spring Security
                    password
                )
            );
        } catch (DisabledException e) {
            throw new DisabledException("USER_DISABLED", e);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("INVALID_CREDENTIALS", e);
        }
    }

    private boolean isEmail(String input) {
        return EMAIL_PATTERN.matcher(input).matches();
    }

    private boolean isPhone(String input) {
        return PHONE_PATTERN.matcher(input).matches();
    }
}