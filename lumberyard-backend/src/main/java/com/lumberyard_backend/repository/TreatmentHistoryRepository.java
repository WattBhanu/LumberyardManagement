package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.TreatmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentHistoryRepository extends JpaRepository<TreatmentHistory, Long> {
    List<TreatmentHistory> findByTreatmentId(Long treatmentId);
}
