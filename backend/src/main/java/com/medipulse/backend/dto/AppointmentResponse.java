package com.medipulse.backend.dto;

import com.medipulse.backend.entity.Appointment;

import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String specialization;
    private LocalDateTime appointmentDate;
    private String reason;
    private String status;

    public AppointmentResponse(Appointment appointment) {
        this.appointmentId = appointment.getAppointmentId();
        this.patientId = appointment.getPatient().getUserId();
        this.doctorId = appointment.getDoctor().getDoctorId();
        this.patientName = appointment.getPatient().getName();
        this.doctorName = appointment.getDoctor().getUser().getName();
        this.specialization = appointment.getDoctor().getSpecialization();
        this.appointmentDate = appointment.getAppointmentDate();
        this.reason = appointment.getReason();
        this.status = appointment.getStatus().name();
    }

public Long getAppointmentId() {
    return appointmentId;
}

public Long getPatientId() {
    return patientId;
}

public Long getDoctorId() {
    return doctorId;
}

public String getPatientName() {
    return patientName;
}

public String getDoctorName() {
    return doctorName;
}

public String getSpecialization() {
    return specialization;
}

public LocalDateTime getAppointmentDate() {
    return appointmentDate;
}

public String getReason() {
    return reason;
}

public String getStatus() {
    return status;
}
}
