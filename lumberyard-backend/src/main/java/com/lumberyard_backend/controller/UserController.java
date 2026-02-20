package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Role;
import com.lumberyard_backend.entity.User;
import com.lumberyard_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam String name, 
                                         @RequestParam String email, 
                                         @RequestParam(required = false) String phone,
                                         @RequestParam String password,
                                         @RequestParam Role role) {
        try {
            User user = userService.createUser(name, email, phone, password, role);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Inner class for error response
    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}