package com.medipulse.backend.service;

import com.medipulse.backend.entity.Alert;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.AlertRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final PatientAccessService patientAccessService;
    private final AuditService auditService;
    private final CriticalAlertNotifier notifier;

    public AlertService(
    AlertRepository alertRepository,
    UserRepository userRepository,
    PatientAccessService patientAccessService,
    AuditService auditService,
    CriticalAlertNotifier notifier) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.patientAccessService = patientAccessService;
        this.auditService = auditService;
        this.notifier = notifier;
    }

public List<Alert> getPatientAlerts(Long patientId) {
    User patient = getPatient(patientId);
    User currentUser = getCurrentUser();

    patientAccessService.assertCanAccessPatient(currentUser, patient.getUserId());

    return alertRepository.findByPatientUserIdOrderByCreatedAtDesc(patientId);
}

public Alert createAlert(Long patientId, Alert.Status status, String message) {
    User patient = getPatient(patientId);

    if (status == null) {
        throw new IllegalArgumentException("Alert status is required");
    }
if (message == null || message.isBlank()) {
    throw new IllegalArgumentException("Alert message is required");
}

Alert alert = new Alert();
alert.setPatient(patient);
alert.setStatus(status);
alert.setMessage(message);
alert.setCreatedAt(LocalDateTime.now());

Alert saved = alertRepository.save(alert);
if (status == Alert.Status.ATTENTION) {
    notifier.notifyAttention(patient, saved);
}
return saved;
}

public Alert resolveAlert(Long alertId) {
    Alert alert = alertRepository.findById(alertId).orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
    User currentUser = getCurrentUser();
    patientAccessService.assertCanAccessPatient(currentUser, alert.getPatient().getUserId());
    if (currentUser.getRole() == User.Role.PATIENT) throw new ForbiddenException("Patients cannot resolve alerts");
    alert.setResolved(true);
    Alert saved = alertRepository.save(alert);
    auditService.log("ALERT_RESOLVED", "ALERT", alertId, alert.getMessage());
    return saved;
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
