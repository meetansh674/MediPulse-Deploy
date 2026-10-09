package com.medipulse.backend.dto;

import com.medipulse.backend.entity.MedicalRecord;

import java.time.LocalDateTime;

public class MedicalRecordResponse {

    private Long recordId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String treatment;
    private LocalDateTime recordDate;

    public MedicalRecordResponse(MedicalRecord record) {
        this.recordId = record.getRecordId();
        this.patientId = record.getPatient().getUserId();
        this.doctorId = record.getDoctor().getDoctorId();
        this.patientName = record.getPatient().getName();
        this.doctorName = record.getDoctor().getUser().getName();
        this.diagnosis = record.getDiagnosis();
        this.treatment = record.getTreatment();
        this.recordDate = record.getRecordDate();
    }

public Long getRecordId() {
    return recordId;
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

public String getDiagnosis() {
    return diagnosis;
}

public String getTreatment() {
    return treatment;
}

public LocalDateTime getRecordDate() {
    return recordDate;
}
}
