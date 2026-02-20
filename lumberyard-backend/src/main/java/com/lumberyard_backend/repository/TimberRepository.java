package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Timber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimberRepository extends JpaRepository<Timber, Long> {
}