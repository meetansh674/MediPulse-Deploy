package com.medipulse.backend.dto;

import com.medipulse.backend.entity.Alert;

import java.time.LocalDateTime;

public class AlertResponse {

    private Long alertId;
    private Long patientId;
    private String patientName;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private boolean resolved;

    public AlertResponse(Alert alert) {
        this.alertId = alert.getAlertId();
        this.patientId = alert.getPatient().getUserId();
        this.patientName = alert.getPatient().getName();
        this.status = alert.getStatus().name();
        this.message = alert.getMessage();
        this.createdAt = alert.getCreatedAt();
        this.resolved = alert.isResolved();
    }

public Long getAlertId() {
    return alertId;
}

public Long getPatientId() {
    return patientId;
}

public String getPatientName() {
    return patientName;
}

public String getStatus() {
    return status;
}

public String getMessage() {
    return message;
}

public boolean isResolved() {
    return resolved;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}
}
