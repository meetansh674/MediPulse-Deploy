package com.medipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AppointmentRequest {

    private Long patientId;

    @NotNull
    private Long doctorId;

    @NotNull
    private LocalDateTime appointmentDate;

    @NotBlank
    private String reason;

    public AppointmentRequest() {
    }

public Long getPatientId() {
    return patientId;
}

public void setPatientId(Long patientId) {
    this.patientId = patientId;
}

public Long getDoctorId() {
    return doctorId;
}

public void setDoctorId(Long doctorId) {
    this.doctorId = doctorId;
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
}
