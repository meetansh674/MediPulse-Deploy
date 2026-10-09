package com.medipulse.backend.controller;

import com.medipulse.backend.dto.DoctorResponse;
import com.medipulse.backend.dto.DoctorSelfUpdateRequest;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.service.DoctorService;
import com.medipulse.backend.service.UserService;
import com.medipulse.backend.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final UserService userService;

    public DoctorController(DoctorService doctorService, UserService userService) { this.doctorService=doctorService; this.userService=userService; }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorService.getAllDoctors()
        .stream()
        .map(DoctorResponse::new)
        .toList();

        return ResponseEntity.ok(doctors);
    }

@GetMapping("/patients")
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<List<UserResponse>> getAuthorizedPatients(Authentication authentication) {
    Long doctorId=(Long) authentication.getPrincipal();
    return ResponseEntity.ok(doctorService.getAuthorizedPatients(doctorId).stream().map(UserResponse::new).toList());
}

@GetMapping("/{id}")
public ResponseEntity<DoctorResponse> getDoctor(@PathVariable Long id) {
    Doctor doctor = doctorService.getDoctorById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

    return ResponseEntity.ok(new DoctorResponse(doctor));
}

@PutMapping("/me")
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<DoctorResponse> updateOwnProfile(
@RequestBody DoctorSelfUpdateRequest request) {

    Doctor doctor = doctorService.updateOwnProfile(request);
    return ResponseEntity.ok(new DoctorResponse(doctor));
}
}
