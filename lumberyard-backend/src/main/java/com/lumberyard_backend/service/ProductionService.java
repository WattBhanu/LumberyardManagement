package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.Production;
import com.lumberyard_backend.entity.ProductionStatus;
import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.ProductionRepository;
import com.lumberyard_backend.repository.TimberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductionService {

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private TimberRepository timberRepository;

    // Start a new production process
    public Production startProduction(Long timberId, String processType, double amount) {
        Timber timber = timberRepository.findById(timberId)
                .orElseThrow(() -> new RuntimeException("Timber not found with id: " + timberId));

        if (timber.getQuantity() < amount) {
            throw new RuntimeException("Insufficient timber quantity.");
        }

        // Deduct timber quantity
        timber.setQuantity((int) (timber.getQuantity() - amount));
        timberRepository.save(timber);

        Production production = new Production();
        production.setTimber(timber);
        production.setProcessType(processType);
        production.setAmount(amount);
        production.setStartTime(LocalDateTime.now());
        production.setStatus(ProductionStatus.STARTED);

        return productionRepository.save(production);
    }

    // Update production status
    public Production updateStatus(Long productionId, ProductionStatus status) {
        Production production = productionRepository.findById(productionId)
                .orElseThrow(() -> new RuntimeException("Production not found with id: " + productionId));

        production.setStatus(status);

        if (status == ProductionStatus.FINISHED || status == ProductionStatus.CANCELLED) {
            production.setEndTime(LocalDateTime.now());
        }

        return productionRepository.save(production);
    }

    // Get all active productions
    public List<Production> getActiveProductions() {
        return productionRepository.findAll().stream()
                .filter(p -> p.getStatus() != ProductionStatus.FINISHED && p.getStatus() != ProductionStatus.CANCELLED)
                .toList();
    }

    // Get all completed productions
    public List<Production> getCompletedProductions() {
        return productionRepository.findByStatus(ProductionStatus.FINISHED);
    }
}
