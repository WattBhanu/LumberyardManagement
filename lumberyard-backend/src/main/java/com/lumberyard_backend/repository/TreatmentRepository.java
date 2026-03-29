package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.TreatmentProcess;
import com.lumberyard_backend.entity.TreatmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentRepository extends JpaRepository<TreatmentProcess, Long> {
    List<TreatmentProcess> findByStatus(TreatmentStatus status);
}
