package com.medipulse.backend.dto;

import com.medipulse.backend.entity.Prescription;

public class PrescriptionResponse {

    private Long prescriptionId;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String medication;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;

    public PrescriptionResponse(Prescription prescription) {
        this.prescriptionId = prescription.getPrescriptionId();
        this.patientId = prescription.getPatient().getUserId();
        this.doctorId = prescription.getDoctor().getDoctorId();
        this.patientName = prescription.getPatient().getName();
        this.doctorName = prescription.getDoctor().getUser().getName();
        this.medication = prescription.getMedication();
        this.dosage = prescription.getDosage();
        this.frequency = prescription.getFrequency();
        this.duration = prescription.getDuration();
        this.instructions = prescription.getInstructions();
    }

public Long getPrescriptionId() {
    return prescriptionId;
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

public String getMedication() {
    return medication;
}

public String getDosage() {
    return dosage;
}

public String getFrequency() {
    return frequency;
}

public String getDuration() {
    return duration;
}

public String getInstructions() {
    return instructions;
}
}
