package com.lumberyard_backend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lumberyard_backend.entity.Chemical;
import java.util.List;

public interface ChemicalRepository extends JpaRepository<Chemical, Long> {

    Chemical findByChemicalCode(String code);

    Chemical findByName(String name);

    List<Chemical> findByChemicalCodeContainingIgnoreCase(String code);

    boolean existsByChemicalCode(String chemicalCode);
    
    @Transactional
    void deleteByChemicalCode(String chemicalCode);   // ✅ ADDED FOR DELETE
}