package com.medipulse.backend.service;

import com.medipulse.backend.dto.LabReportRequest;
import com.medipulse.backend.entity.LabReport;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.LabReportRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabReportService {

    private final LabReportRepository labReportRepository;
    private final UserRepository userRepository;
    private final PatientAccessService patientAccessService;

    public LabReportService(
    LabReportRepository labReportRepository,
    UserRepository userRepository,
    PatientAccessService patientAccessService) {
        this.labReportRepository = labReportRepository;
        this.userRepository = userRepository;
        this.patientAccessService = patientAccessService;
    }

public LabReport createLabReport(LabReportRequest request) {
    User patient = getPatient(request.getPatientId());
    User creator = getCurrentUser();

    if (creator.getRole() != User.Role.DOCTOR && creator.getRole() != User.Role.ADMIN) {
        throw new ForbiddenException("Only doctors or admins can create lab reports");
    }

if (creator.getRole() == User.Role.DOCTOR) {
    patientAccessService.assertCanAccessPatient(creator, patient.getUserId());
}

LabReport report = new LabReport();
report.setPatient(patient);
report.setCreatedBy(creator);
report.setTestName(request.getTestName());
report.setResult(request.getResult());
report.setReportDate(request.getReportDate());
report.setFileReference(request.getFileReference());

return labReportRepository.save(report);
}

public List<LabReport> getPatientLabReports(Long patientId) {
    User patient = getPatient(patientId);
    User currentUser = getCurrentUser();

    patientAccessService.assertCanAccessPatient(currentUser, patient.getUserId());

    return labReportRepository.findByPatientUserId(patientId);
}

public LabReport getReportForFile(String fileReference) {
    LabReport report = labReportRepository.findFirstByFileReference(fileReference)
    .orElseThrow(() -> new ResourceNotFoundException("File not found"));
    User currentUser = getCurrentUser();
    patientAccessService.assertCanAccessPatient(currentUser, report.getPatient().getUserId());
    return report;
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
