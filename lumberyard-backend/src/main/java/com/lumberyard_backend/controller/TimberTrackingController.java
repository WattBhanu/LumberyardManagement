package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.TimberTracking;
import com.lumberyard_backend.service.TimberTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timber-tracking")
@CrossOrigin(origins = "*")
public class TimberTrackingController {

    @Autowired
    private TimberTrackingService timberTrackingService;

    @GetMapping("/all")
    public ResponseEntity<List<TimberTracking>> getAllTracking() {
        return ResponseEntity.ok(timberTrackingService.getAllTracking());
    }

    @GetMapping("/by-original/{originalTimberId}")
    public ResponseEntity<List<TimberTracking>> getByOriginalTimber(@PathVariable Long originalTimberId) {
        return ResponseEntity.ok(timberTrackingService.getByOriginalTimber(originalTimberId));
    }
}
