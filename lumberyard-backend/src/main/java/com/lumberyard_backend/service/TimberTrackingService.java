package com.lumberyard_backend.service;

import com.lumberyard_backend.entity.TimberTracking;
import com.lumberyard_backend.repository.TimberTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimberTrackingService {

    @Autowired
    private TimberTrackingRepository timberTrackingRepository;

    public List<TimberTracking> getAllTracking() {
        return timberTrackingRepository.findAll();
    }

    public List<TimberTracking> getByOriginalTimber(Long originalTimberId) {
        return timberTrackingRepository.findByOriginalTimberId(originalTimberId);
    }
}
