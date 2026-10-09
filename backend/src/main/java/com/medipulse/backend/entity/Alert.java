package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean resolved = false;

    public enum Status {
        NORMAL,
        WARNING,
        ATTENTION
    }

public Alert() {
}

public Long getAlertId() {
    return alertId;
}

public void setAlertId(Long alertId) {
    this.alertId = alertId;
}

public User getPatient() {
    return patient;
}

public void setPatient(User patient) {
    this.patient = patient;
}

public Status getStatus() {
    return status;
}

public void setStatus(Status status) {
    this.status = status;
}

public String getMessage() {
    return message;
}

public void setMessage(String message) {
    this.message = message;
}

public boolean isResolved() {
    return resolved;
}

public void setResolved(boolean resolved) {
    this.resolved = resolved;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}
}
