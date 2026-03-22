/*package com.lumberyard_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class Chemical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String chemicalCode; // e.g., C001
    private String name;
    private double quantity; // stock available
    private String status; // e.g., "Available" or "Low Stock"*/
package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
public class Chemical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String chemicalCode;   // MUST be unique

    private String name;
    private double quantity;
    private String status;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getChemicalCode() { return chemicalCode; }
    public void setChemicalCode(String chemicalCode) { this.chemicalCode = chemicalCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}