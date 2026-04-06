package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Treatment;
import com.lumberyard_backend.entity.TreatmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByStatus(TreatmentStatus status);
}
