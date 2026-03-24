package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByStatus(String status);
    List<Worker> findByStatusIgnoreCase(String status);
}
