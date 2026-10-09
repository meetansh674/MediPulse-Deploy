package com.medipulse.backend.controller;

import com.medipulse.backend.dto.LabReportRequest;
import com.medipulse.backend.dto.LabReportResponse;
import com.medipulse.backend.entity.LabReport;
import com.medipulse.backend.service.LabFileStorageService;
import com.medipulse.backend.service.LabReportService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lab-reports")
public class LabReportController {

    private final LabReportService labReportService;
    private final LabFileStorageService fileStorageService;

    public LabReportController(LabReportService labReportService, LabFileStorageService fileStorageService) {
        this.labReportService = labReportService;
        this.fileStorageService = fileStorageService;
    }

@GetMapping("/patient/{patientId}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<List<LabReportResponse>> getPatientLabReports(
@PathVariable Long patientId) {

    List<LabReportResponse> reports = labReportService
    .getPatientLabReports(patientId)
    .stream()
    .map(LabReportResponse::new)
    .toList();

    return ResponseEntity.ok(reports);
}

@PostMapping
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public ResponseEntity<LabReportResponse> createLabReport(
@Valid @RequestBody LabReportRequest request) {

    LabReportResponse response = new LabReportResponse(
    labReportService.createLabReport(request));

    return ResponseEntity.status(201).body(response);
}

@PostMapping("/upload")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public ResponseEntity<Map<String, String>> uploadLabFile(
@RequestParam("file") MultipartFile file) {

    String stored = fileStorageService.store(file);
    return ResponseEntity.status(201).body(Map.of(
    "fileReference", stored,
    "fileUrl", "/api/lab-reports/files/" + stored));
}

@GetMapping("/files/{filename:.+}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<Resource> downloadLabFile(
@PathVariable String filename) {

    LabReport report = labReportService.getReportForFile(filename);
    Resource resource = fileStorageService.load(filename);
    return ResponseEntity.ok()
    .contentType(MediaType.parseMediaType(fileStorageService.contentType(filename)))
    .header(HttpHeaders.CONTENT_DISPOSITION,
    "inline; filename=\"" + report.getTestName().replaceAll("[^A-Za-z0-9._-]", "_") + "_" + filename + "\"")
    .body(resource);
}
}
