package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Wages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WagesRepository extends JpaRepository<Wages, Long> {
    List<Wages> findByWorker_WorkerId(Long workerId);
}
