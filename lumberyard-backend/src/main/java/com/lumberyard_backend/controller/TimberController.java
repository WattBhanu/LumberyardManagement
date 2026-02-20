package com.lumberyard_backend.controller;

import com.lumberyard_backend.entity.Timber;
import com.lumberyard_backend.repository.TimberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timber")
public class TimberController {

    @Autowired
    private TimberRepository timberRepository;

    @GetMapping("/all")
    public List<Timber> getAllTimbers() {
        return timberRepository.findAll();
    }

    @PostMapping("/add")
    public Timber addTimber(@RequestBody Timber timber) {
        return timberRepository.save(timber);
    }
}