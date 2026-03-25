package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.MaterialUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialUsageRepository extends JpaRepository<MaterialUsage, Long> {
}
