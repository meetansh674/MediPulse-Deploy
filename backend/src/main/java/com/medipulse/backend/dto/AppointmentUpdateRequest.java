package com.medipulse.backend.dto;

import com.medipulse.backend.entity.Appointment;

import java.time.LocalDateTime;

public class AppointmentUpdateRequest {

    private Long doctorId;
    private LocalDateTime appointmentDate;
    private String reason;
    private Appointment.Status status;

    public AppointmentUpdateRequest() {
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

public Appointment.Status getStatus() {
    return status;
}

public void setStatus(Appointment.Status status) {
    this.status = status;
}
}
