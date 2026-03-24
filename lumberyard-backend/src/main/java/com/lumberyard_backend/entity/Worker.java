package com.lumberyard_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worker_id")
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String position;

    private String department;

    private String status; // Active, Inactive

    private LocalDate hireDate;

    private LocalDate dateOfBirth;

    @Column(name = "home_address")
    private String homeAddress;

    // Legacy address column — kept for backward compat
    @Column(name = "address")
    private String address;
}
