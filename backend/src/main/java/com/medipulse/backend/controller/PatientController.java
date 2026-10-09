package com.medipulse.backend.controller;

import com.medipulse.backend.dto.UserResponse;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final UserService userService;

    public PatientController(UserService userService) {
        this.userService = userService;
    }

@GetMapping("/{id}")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
public ResponseEntity<UserResponse> getPatient(
@PathVariable Long id,
Authentication authentication) {

    Long loggedInUserId = (Long) authentication.getPrincipal();
    boolean isPatient = authentication.getAuthorities().stream()
    .anyMatch(authority -> authority.getAuthority().equals("ROLE_PATIENT"));

    if (isPatient && !loggedInUserId.equals(id)) {
        throw new ForbiddenException("Patients can only view their own profile");
    }

User patient = userService.getUserById(id)
.filter(user -> user.getRole() == User.Role.PATIENT)
.orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

return ResponseEntity.ok(new UserResponse(patient));
}
}
