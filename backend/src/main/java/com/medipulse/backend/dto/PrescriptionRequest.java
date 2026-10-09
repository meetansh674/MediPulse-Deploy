package com.medipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PrescriptionRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String medication;

    @NotBlank
    private String dosage;

    @NotBlank
    private String frequency;

    @NotBlank
    private String duration;

    private String instructions;

    public PrescriptionRequest() {
    }

public Long getPatientId() {
    return patientId;
}

public void setPatientId(Long patientId) {
    this.patientId = patientId;
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
