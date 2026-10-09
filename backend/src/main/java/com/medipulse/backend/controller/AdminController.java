package com.medipulse.backend.controller;

import com.medipulse.backend.dto.AdminDoctorCreateRequest;
import com.medipulse.backend.dto.AdminDoctorUpdateRequest;
import com.medipulse.backend.dto.AdminStatsResponse;
import com.medipulse.backend.dto.AuditLogResponse;
import com.medipulse.backend.dto.DoctorResponse;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

@GetMapping("/stats")
public ResponseEntity<AdminStatsResponse> getStatistics() {
    return ResponseEntity.ok(adminService.getStatistics());
}

@PostMapping("/doctors")
public ResponseEntity<DoctorResponse> createDoctor(
@Valid @RequestBody AdminDoctorCreateRequest request) {

    Doctor doctor = adminService.createDoctor(request);
    return ResponseEntity.status(201).body(new DoctorResponse(doctor));
}

@PutMapping("/doctors/{id}")
public ResponseEntity<DoctorResponse> updateDoctor(
@PathVariable Long id,
@RequestBody AdminDoctorUpdateRequest request) {

    Doctor doctor = adminService.updateDoctor(id, request);
    return ResponseEntity.ok(new DoctorResponse(doctor));
}

@GetMapping("/audit-log")
public ResponseEntity<List<AuditLogResponse>> getAuditLog() {
    return ResponseEntity.ok(adminService.getAuditLog().stream().map(AuditLogResponse::new).toList());
}
}
