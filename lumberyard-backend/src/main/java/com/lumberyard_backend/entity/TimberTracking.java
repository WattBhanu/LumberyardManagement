package com.lumberyard_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "timber_tracking")
public class TimberTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "treated_timber_id", nullable = false)
    private Timber treatedTimber; // The new treated timber record

    @ManyToOne
    @JoinColumn(name = "original_timber_id", nullable = false)
    private Timber originalTimber; // The original untreated timber it came from

    private double treatedQuantity; // Quantity that was treated

    public Long getId() { return id; }

    public Timber getTreatedTimber() { return treatedTimber; }
    public void setTreatedTimber(Timber treatedTimber) { this.treatedTimber = treatedTimber; }

    public Timber getOriginalTimber() { return originalTimber; }
    public void setOriginalTimber(Timber originalTimber) { this.originalTimber = originalTimber; }

    public double getTreatedQuantity() { return treatedQuantity; }
    public void setTreatedQuantity(double treatedQuantity) { this.treatedQuantity = treatedQuantity; }
}
