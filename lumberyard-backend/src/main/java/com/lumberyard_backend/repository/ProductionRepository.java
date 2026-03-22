package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {
    List<Production> findByStatus(ProductionStatus status);
}
