package com.medipulse.backend.controller;

import com.medipulse.backend.dto.AlertResponse;
import com.medipulse.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public ResponseEntity<AlertResponse> resolveAlert(@PathVariable Long id) {
    return ResponseEntity.ok(new AlertResponse(alertService.resolveAlert(id)));
}

@GetMapping("/patient/{patientId}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<List<AlertResponse>>
getPatientAlerts(@PathVariable Long patientId) {

    List<AlertResponse> alerts =
    alertService.getPatientAlerts(patientId)
    .stream()
    .map(AlertResponse::new)
    .toList();

    return ResponseEntity.ok(alerts);
}
}
