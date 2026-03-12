package com.lumberyard_backend.repository;

import java.util.List;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lumberyard_backend.entity.Logs;

public interface LogsRepository extends JpaRepository<Logs, Long> {

    Logs findByLogCode(String code);

    List<Logs> findByLogCodeContainingIgnoreCase(String code);

    boolean existsByLogCode(String logCode);
@Transactional
    void deleteByLogCode(String logCode);   // ✅ ADDED DELETE METHOD
}