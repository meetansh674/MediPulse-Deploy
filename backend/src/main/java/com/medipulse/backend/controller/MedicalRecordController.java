package com.medipulse.backend.controller;

import com.medipulse.backend.dto.MedicalRecordRequest;
import com.medipulse.backend.dto.MedicalRecordResponse;
import com.medipulse.backend.entity.MedicalRecord;
import com.medipulse.backend.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

@GetMapping("/patient/{patientId}")
@PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(
@PathVariable Long patientId) {

    List<MedicalRecordResponse> records =
    medicalRecordService.getPatientRecords(patientId)
    .stream()
    .map(MedicalRecordResponse::new)
    .toList();

    return ResponseEntity.ok(records);
}

@PostMapping
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<MedicalRecordResponse> createRecord(
@Valid @RequestBody MedicalRecordRequest request) {

    MedicalRecord record =
    medicalRecordService.createRecord(request);

    return ResponseEntity
    .status(201)
    .body(new MedicalRecordResponse(record));
}
}
