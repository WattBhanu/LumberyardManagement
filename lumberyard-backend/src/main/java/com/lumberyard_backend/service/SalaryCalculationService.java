package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Worker;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;

@Service
public class SalaryCalculationService {

    private static final double BASE_RATE_MIN = 200.0;
    private static final double BASE_RATE_MAX = 250.0;
    private static final double BASE_RATE_AVG = 225.0;

    private static final Map<String, double[]> POSITION_MULTIPLIERS = new HashMap<>();

    static {
        POSITION_MULTIPLIERS.put("Sawyer", new double[]{1.3, 1.6});
        POSITION_MULTIPLIERS.put("Forklift Operator", new double[]{1.2, 1.5});
        POSITION_MULTIPLIERS.put("Team Lead", new double[]{1.5, 2.0});
        POSITION_MULTIPLIERS.put("Supervisor", new double[]{2.0, 2.8});
        POSITION_MULTIPLIERS.put("Quality Inspector", new double[]{1.6, 2.2});
        POSITION_MULTIPLIERS.put("Maintenance Technician", new double[]{1.8, 2.8});
        POSITION_MULTIPLIERS.put("Logistics Coordinator", new double[]{1.5, 2.0});
    }

    public double calculateHourlyWage(Worker worker) {
        String position = worker.getPosition();
        LocalDate hireDate = worker.getHireDate();

        if (position == null || hireDate == null) {
            return BASE_RATE_AVG;
        }

        double[] range = POSITION_MULTIPLIERS.getOrDefault(position, new double[]{1.0, 1.0});
        int yearsOfExperience = Period.between(hireDate, LocalDate.now()).getYears();

        double multiplier;
        if (yearsOfExperience <= 2) {
            multiplier = range[0]; // Lower bound
        } else if (yearsOfExperience <= 5) {
            multiplier = (range[0] + range[1]) / 2.0; // Average
        } else {
            multiplier = range[1]; // Upper bound
        }

        double baseRate = BASE_RATE_AVG;
        double wage = baseRate * multiplier;

        // Ensure wage is within realistic limits (200 - 700)
        wage = Math.max(200.0, Math.min(700.0, wage));

        return Math.round(wage);
    }

    public double calculateDailySalary(double hourlyWage, double hoursWorked) {
        return Math.round(hourlyWage * hoursWorked);
    }
}
