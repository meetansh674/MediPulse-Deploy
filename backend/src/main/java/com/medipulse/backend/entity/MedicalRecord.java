package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String diagnosis;

    private String treatment;

    @Column(name = "record_date", nullable = false)
    private LocalDateTime recordDate;

    public MedicalRecord() {
    }

public Long getRecordId() {
    return recordId;
}

public void setRecordId(Long recordId) {
    this.recordId = recordId;
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
