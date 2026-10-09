package com.medipulse.backend.controller;

import com.medipulse.backend.dto.PrescriptionRequest;
import com.medipulse.backend.dto.PrescriptionResponse;
import com.medipulse.backend.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

@GetMapping("/patient/{patientId}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(
@PathVariable Long patientId) {

    List<PrescriptionResponse> prescriptions = prescriptionService
    .getPatientPrescriptions(patientId)
    .stream()
    .map(PrescriptionResponse::new)
    .toList();

    return ResponseEntity.ok(prescriptions);
}

@PostMapping
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<PrescriptionResponse> createPrescription(
@Valid @RequestBody PrescriptionRequest request) {

    PrescriptionResponse response = new PrescriptionResponse(
    prescriptionService.createPrescription(request));

    return ResponseEntity.status(201).body(response);
}
}
