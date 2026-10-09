package com.medipulse.backend.service;

import com.medipulse.backend.dto.PrescriptionRequest;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.Prescription;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.PrescriptionRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientAccessService patientAccessService;

    public PrescriptionService(
    PrescriptionRepository prescriptionRepository,
    UserRepository userRepository,
    DoctorRepository doctorRepository,
    PatientAccessService patientAccessService) {
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientAccessService = patientAccessService;
    }

public Prescription createPrescription(PrescriptionRequest request) {
    User patient = getPatient(request.getPatientId());
    User doctorUser = getCurrentUser();

    if (doctorUser.getRole() != User.Role.DOCTOR) {
        throw new ForbiddenException("Only doctors can create prescriptions");
    }

Doctor doctor = doctorRepository.findById(doctorUser.getUserId())
.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

patientAccessService.assertCanAccessPatient(doctorUser, patient.getUserId());

Prescription prescription = new Prescription();
prescription.setPatient(patient);
prescription.setDoctor(doctor);
prescription.setMedication(request.getMedication());
prescription.setDosage(request.getDosage());
prescription.setFrequency(request.getFrequency());
prescription.setDuration(request.getDuration());
prescription.setInstructions(request.getInstructions());

return prescriptionRepository.save(prescription);
}

public List<Prescription> getPatientPrescriptions(Long patientId) {
    User patient = getPatient(patientId);
    User currentUser = getCurrentUser();

    patientAccessService.assertCanAccessPatient(currentUser, patient.getUserId());

    return prescriptionRepository.findByPatientUserId(patientId);
}

private User getPatient(Long patientId) {
    User user = userRepository.findById(patientId)
    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

    if (user.getRole() != User.Role.PATIENT) {
        throw new IllegalArgumentException("User is not a patient");
    }

return user;
}

private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null ||
    !authentication.isAuthenticated() ||
    !(authentication.getPrincipal() instanceof Long currentUserId)) {
        throw new ForbiddenException("User not authenticated");
    }

return userRepository.findById(currentUserId)
.orElseThrow(() -> new ForbiddenException("Authenticated user not found"));
}
}
