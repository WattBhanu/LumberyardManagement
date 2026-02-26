package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
public class Logs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String logCode;   // unique code e.g., L001

    private String name;      // Name of the log
    private double length;    // Length of the log
    private double cubicFeet; // Cubic feet
    private double quantity;  // Quantity in stock

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLogCode() { return logCode; }
    public void setLogCode(String logCode) { this.logCode = logCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }

    public double getCubicFeet() { return cubicFeet; }
    public void setCubicFeet(double cubicFeet) { this.cubicFeet = cubicFeet; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
}