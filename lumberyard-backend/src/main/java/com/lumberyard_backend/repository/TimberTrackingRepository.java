package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.TimberTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimberTrackingRepository extends JpaRepository<TimberTracking, Long> {
    
    List<TimberTracking> findByOriginalTimberId(Long originalTimberId);
    
    List<TimberTracking> findByTreatedTimberId(Long treatedTimberId);
}
