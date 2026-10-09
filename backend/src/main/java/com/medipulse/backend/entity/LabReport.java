package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_reports")
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_report_id")
    private Long labReportId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(nullable = false)
    private String result;

    @Column(name = "report_date", nullable = false)
    private LocalDateTime reportDate;

    @Column(name = "file_reference")
    private String fileReference;

    public LabReport() {
    }

public Long getLabReportId() {
    return labReportId;
}

public void setLabReportId(Long labReportId) {
    this.labReportId = labReportId;
}

public User getPatient() {
    return patient;
}

public void setPatient(User patient) {
    this.patient = patient;
}

public User getCreatedBy() {
    return createdBy;
}

public void setCreatedBy(User createdBy) {
    this.createdBy = createdBy;
}

public String getTestName() {
    return testName;
}

public void setTestName(String testName) {
    this.testName = testName;
}

public String getResult() {
    return result;
}

public void setResult(String result) {
    this.result = result;
}

public LocalDateTime getReportDate() {
    return reportDate;
}

public void setReportDate(LocalDateTime reportDate) {
    this.reportDate = reportDate;
}

public String getFileReference() {
    return fileReference;
}

public void setFileReference(String fileReference) {
    this.fileReference = fileReference;
}
}
