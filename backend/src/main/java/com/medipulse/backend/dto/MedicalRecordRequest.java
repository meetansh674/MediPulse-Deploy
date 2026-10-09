package com.medipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class MedicalRecordRequest {

    @NotNull
    private Long patientId;

    private Long doctorId;

    @NotBlank
    private String diagnosis;

    private String treatment;

    @NotNull
    private LocalDateTime recordDate;

    public MedicalRecordRequest() {
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

public String getDiagnosis() {
    return diagnosis;
}

public void setDiagnosis(String diagnosis) {
    this.diagnosis = diagnosis;
}

public String getTreatment() {
    return treatment;
}

public void setTreatment(String treatment) {
    this.treatment = treatment;
}

public LocalDateTime getRecordDate() {
    return recordDate;
}

public void setRecordDate(LocalDateTime recordDate) {
    this.recordDate = recordDate;
}
}
