package com.medipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class LabReportRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String testName;

    @NotBlank
    private String result;

    @NotNull
    private LocalDateTime reportDate;

    private String fileReference;

    public LabReportRequest() {
    }

public Long getPatientId() {
    return patientId;
}

public void setPatientId(Long patientId) {
    this.patientId = patientId;
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
