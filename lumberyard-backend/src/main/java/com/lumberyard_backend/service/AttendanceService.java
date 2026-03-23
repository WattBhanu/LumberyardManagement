package com.lumberyard_backend.service;

import com.lumberyard_backend.dto.AttendanceRequest;
import com.lumberyard_backend.entity.Attendance;
import com.lumberyard_backend.entity.Worker;
import com.lumberyard_backend.repository.AttendanceRepository;
import com.lumberyard_backend.repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public Attendance recordAttendance(AttendanceRequest request) {
        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        Optional<Attendance> existing = attendanceRepository.findByWorker_IdAndDate(worker.getId(), request.getDate());
        
        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
        } else {
            attendance = new Attendance();
            attendance.setWorker(worker);
            attendance.setDate(request.getDate());
        }

        if (request.getStatus() != null) attendance.setStatus(request.getStatus());
        if (request.getNote() != null) attendance.setNote(request.getNote());
        if (request.getArrivalTime() != null) attendance.setArrivalTime(request.getArrivalTime());
        if (request.getDepartureTime() != null) attendance.setDepartureTime(request.getDepartureTime());

        // Automatically calculate worked hours if both arrival and departure are set
        if (attendance.getArrivalTime() != null && attendance.getDepartureTime() != null) {
            Duration duration = Duration.between(attendance.getArrivalTime(), attendance.getDepartureTime());
            double hours = duration.toMinutes() / 60.0;
            attendance.setWorkedHours(Math.round(hours * 100.0) / 100.0);
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
}
