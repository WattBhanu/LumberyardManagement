package com.lumberyard_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Timber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double length;
    private double width;
    private double thickness;
    private double price;
    private String status;

    // Constructors, getters, setters
    public Timber() {}

    public Timber(String name, double length, double width, double thickness, double price, String status) {
        this.name = name;
        this.length = length;
        this.width = width;
        this.thickness = thickness;
        this.price = price;
        this.status = status;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public double getThickness() { return thickness; }
    public void setThickness(double thickness) { this.thickness = thickness; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}