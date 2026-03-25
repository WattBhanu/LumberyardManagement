package com.lumberyard_backend.repository;

import com.lumberyard_backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Optional<Worker> findByEmail(String email);
    Optional<Worker> findByPhone(String phone);
    // Replaced findByName with findByFirstNameAndLastName due to entity change
    Optional<Worker> findByFirstNameAndLastName(String firstName, String lastName);
    List<Worker> findByDepartment(String department);
    List<Worker> findByStatus(Worker.WorkerStatus status);
    List<Worker> findByIsAvailable(Boolean isAvailable);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    // Replaced existsByName with existsByFirstNameAndLastName
    boolean existsByFirstNameAndLastName(String firstName, String lastName);
}
