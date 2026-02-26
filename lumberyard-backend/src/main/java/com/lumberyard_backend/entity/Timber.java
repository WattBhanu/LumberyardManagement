package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
public class Timber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // Internal DB ID (DO NOT EDIT)

    @Column(unique = true, nullable = false)
    private String timberCode;   // Custom Editable ID (T001, T002)

    private String name;
    private String status;

    private double length;
    private double width;
    private double thickness;
    private double longFeet;
    private double price;
    private double quantity;

    // Getters and Setters

    public Long getId() { return id; }

    public String getTimberCode() { return timberCode; }
    public void setTimberCode(String timberCode) { this.timberCode = timberCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public double getThickness() { return thickness; }
    public void setThickness(double thickness) { this.thickness = thickness; }

    public double getLongFeet() { return longFeet; }
    public void setLongFeet(double longFeet) { this.longFeet = longFeet; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
}