package com.medipulse.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String medication;

    @Column(nullable = false)
    private String dosage;

    @Column(nullable = false)
    private String frequency;

    @Column(nullable = false)
    private String duration;

    private String instructions;

    public Prescription() {
    }

public Long getPrescriptionId() {
    return prescriptionId;
}

public void setPrescriptionId(Long prescriptionId) {
    this.prescriptionId = prescriptionId;
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

public String getMedication() {
    return medication;
}

public void setMedication(String medication) {
    this.medication = medication;
}

public String getDosage() {
    return dosage;
}

public void setDosage(String dosage) {
    this.dosage = dosage;
}

public String getFrequency() {
    return frequency;
}

public void setFrequency(String frequency) {
    this.frequency = frequency;
}

public String getDuration() {
    return duration;
}

public void setDuration(String duration) {
    this.duration = duration;
}

public String getInstructions() {
    return instructions;
}

public void setInstructions(String instructions) {
    this.instructions = instructions;
}
}
