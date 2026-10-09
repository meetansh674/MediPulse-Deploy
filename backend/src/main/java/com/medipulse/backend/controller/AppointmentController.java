package com.medipulse.backend.controller;

import com.medipulse.backend.dto.AppointmentRequest;
import com.medipulse.backend.dto.AppointmentResponse;
import com.medipulse.backend.service.AppointmentService;
import com.medipulse.backend.dto.AppointmentUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

@GetMapping
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<List<AppointmentResponse>> getAppointments(
@RequestParam(defaultValue = "0") int page,
@RequestParam(defaultValue = "100") int size) {
    if (page < 0 || size < 1 || size > 500) throw new IllegalArgumentException("Invalid pagination parameters");
    List<AppointmentResponse> all = appointmentService.getVisibleAppointments().stream().map(AppointmentResponse::new).toList();
    int from = Math.min(page * size, all.size());
    int to = Math.min(from + size, all.size());
    return ResponseEntity.ok(all.subList(from, to));
}

@GetMapping("/{id}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<AppointmentResponse> getAppointment(@PathVariable Long id) {
    return ResponseEntity.ok(
    new AppointmentResponse(appointmentService.getVisibleAppointmentById(id)));
}

@PostMapping
@PreAuthorize("hasRole('PATIENT')")
public ResponseEntity<AppointmentResponse> createAppointment(
@Valid @RequestBody AppointmentRequest request) {

    AppointmentResponse response = new AppointmentResponse(
    appointmentService.createAppointment(request));

    return ResponseEntity.status(201).body(response);
}

@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<AppointmentResponse> updateAppointment(
@PathVariable Long id,
@RequestBody AppointmentUpdateRequest request) {

    return ResponseEntity.ok(
    new AppointmentResponse(
    appointmentService.updateAppointment(id, request)
    )
    );
}

@DeleteMapping("/{id}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
    appointmentService.deleteAppointment(id);
    return ResponseEntity.noContent().build();
}
}
