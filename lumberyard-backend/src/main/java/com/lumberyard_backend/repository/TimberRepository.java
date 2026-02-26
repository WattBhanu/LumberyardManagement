package com.lumberyard_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import com.lumberyard_backend.entity.Timber;
import java.util.List;

public interface TimberRepository extends JpaRepository<Timber, Long> {

    Timber findByTimberCode(String timberCode);

    List<Timber> findByTimberCodeContainingIgnoreCase(String timberCode);

    boolean existsByTimberCode(String timberCode);

    @Transactional
    void deleteByTimberCode(String timberCode);
}