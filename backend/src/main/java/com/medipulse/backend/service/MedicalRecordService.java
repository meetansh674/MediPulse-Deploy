package com.medipulse.backend.service;

import com.medipulse.backend.dto.MedicalRecordRequest;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.MedicalRecord;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.MedicalRecordRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientAccessService patientAccessService;

    public MedicalRecordService(
    MedicalRecordRepository medicalRecordRepository,
    UserRepository userRepository,
    DoctorRepository doctorRepository,
    PatientAccessService patientAccessService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientAccessService = patientAccessService;
    }

public MedicalRecord createRecord(MedicalRecordRequest request) {
    User authenticatedUser = getCurrentUser();

    if (authenticatedUser.getRole() != User.Role.DOCTOR) {
        throw new ForbiddenException("Only doctors can create medical records");
    }

Doctor doctor = doctorRepository.findById(authenticatedUser.getUserId())
.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

User patient = getPatient(request.getPatientId());
patientAccessService.assertCanAccessPatient(authenticatedUser, patient.getUserId());

MedicalRecord record = new MedicalRecord();
record.setPatient(patient);
record.setDoctor(doctor);
record.setDiagnosis(request.getDiagnosis());
record.setTreatment(request.getTreatment());
record.setRecordDate(request.getRecordDate());

return medicalRecordRepository.save(record);
}

public List<MedicalRecord> getPatientRecords(Long patientId) {
    User patient = getPatient(patientId);
    User currentUser = getCurrentUser();

    patientAccessService.assertCanAccessPatient(currentUser, patient.getUserId());

    return medicalRecordRepository.findByPatientUserId(patientId);
}

public List<MedicalRecord> getDoctorRecords(Long doctorId) {
    return medicalRecordRepository.findByDoctorDoctorId(doctorId);
}

public Optional<MedicalRecord> getRecordById(Long recordId) {
    return medicalRecordRepository.findById(recordId);
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
