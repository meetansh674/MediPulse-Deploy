package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status {
        SCHEDULED,
        COMPLETED,
        CANCELLED
    }

public Appointment() {
}

public Long getAppointmentId() {
    return appointmentId;
}

public void setAppointmentId(Long appointmentId) {
    this.appointmentId = appointmentId;
}

public User getPatient() {
    return patient;
}

public void setPatient(User patient) {
    this.patient = patient;
}

public Doctor getDoctor() {
    return doctor;
}

public void setDoctor(Doctor doctor) {
    this.doctor = doctor;
}

public LocalDateTime getAppointmentDate() {
    return appointmentDate;
}

public void setAppointmentDate(LocalDateTime appointmentDate) {
    this.appointmentDate = appointmentDate;
}

public String getReason() {
    return reason;
}

public void setReason(String reason) {
    this.reason = reason;
}

public Status getStatus() {
    return status;
}

public void setStatus(Status status) {
    this.status = status;
}
}
