package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.AttendanceRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        Optional<Worker> worker = workerRepository.findById(id);
        return worker.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Worker createWorker(@RequestBody Worker worker) {
        return workerRepository.save(worker);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @RequestBody Worker workerDetails) {
        return workerRepository.findById(id).map(worker -> {
            worker.setFirstName(workerDetails.getFirstName());
            worker.setLastName(workerDetails.getLastName());
            worker.setEmail(workerDetails.getEmail());
            worker.setPhone(workerDetails.getPhone());
            worker.setPosition(workerDetails.getPosition());
            worker.setDepartment(workerDetails.getDepartment());
            worker.setStatus(workerDetails.getStatus());
            worker.setHireDate(workerDetails.getHireDate());
            worker.setDateOfBirth(workerDetails.getDateOfBirth());
            worker.setHomeAddress(workerDetails.getHomeAddress());
            Worker updatedWorker = workerRepository.save(worker);
            return ResponseEntity.ok(updatedWorker);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorker(@PathVariable Long id) {
        return workerRepository.findById(id).map(worker -> {
            // Delete attendance records first to avoid foreign key constraint violation
            List<?> attendances = attendanceRepository.findByWorker_IdAndDateBetween(
                worker.getId(),
                java.time.LocalDate.of(2000, 1, 1),
                java.time.LocalDate.of(2100, 12, 31));
            attendanceRepository.deleteAll((java.util.List<com.lumberyard_backend.entity.Attendance>) attendances);
            workerRepository.delete(worker);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getWorkerStats() {
        long total = workerRepository.count();
        long active = workerRepository.findByStatus("Active").size();
        long inactive = workerRepository.findByStatus("Inactive").size();
        
        return ResponseEntity.ok(new WorkerStats(total, active, inactive));
    }

    public static class WorkerStats {
        public long totalWorkers;
        public long activeWorkers;
        public long inactiveWorkers;

        public WorkerStats(long total, long active, long inactive) {
            this.totalWorkers = total;
            this.activeWorkers = active;
            this.inactiveWorkers = inactive;
        }
    }
}
