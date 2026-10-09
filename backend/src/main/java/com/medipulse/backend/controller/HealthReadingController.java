package com.medipulse.backend.controller;

import com.medipulse.backend.dto.HealthReadingRequest;
import com.medipulse.backend.dto.HealthReadingResponse;
import com.medipulse.backend.service.HealthReadingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-readings")
public class HealthReadingController {

    private final HealthReadingService healthReadingService;

    public HealthReadingController(HealthReadingService healthReadingService) {
        this.healthReadingService = healthReadingService;
    }

@GetMapping("/patient/{patientId}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<List<HealthReadingResponse>> getPatientReadings(
@PathVariable Long patientId,
@RequestParam(defaultValue = "0") int page,
@RequestParam(defaultValue = "100") int size) {
    if (page < 0 || size < 1 || size > 500) throw new IllegalArgumentException("Invalid pagination parameters");
    List<HealthReadingResponse> all = healthReadingService.getPatientReadings(patientId).stream().map(HealthReadingResponse::new).toList();
    int from=Math.min(page*size,all.size()); int to=Math.min(from+size,all.size());
    return ResponseEntity.ok(all.subList(from,to));
}

@PostMapping
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<HealthReadingResponse> createReading(
@Valid @RequestBody HealthReadingRequest request) {

    HealthReadingResponse response = new HealthReadingResponse(
    healthReadingService.createReading(request));

    return ResponseEntity.status(201).body(response);
}
}
