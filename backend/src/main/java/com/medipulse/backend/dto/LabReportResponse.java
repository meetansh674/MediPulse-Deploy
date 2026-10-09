package com.medipulse.backend.dto;

import com.medipulse.backend.entity.LabReport;

import java.time.LocalDateTime;

public class LabReportResponse {

    private Long labReportId;

    private Long patientId;
    private String patientName;

    private Long createdByUserId;
    private String createdByName;
    private String createdByRole;

    private String doctorName;

    private String testName;
    private String result;
    private LocalDateTime reportDate;
    private String fileReference;

    public LabReportResponse(LabReport report) {

        this.labReportId = report.getLabReportId();

        this.patientId = report.getPatient().getUserId();
        this.patientName = report.getPatient().getName();

        this.createdByUserId = report.getCreatedBy().getUserId();
        this.createdByName = report.getCreatedBy().getName();
        this.createdByRole = report.getCreatedBy().getRole().name();

        if (report.getCreatedBy().getRole().name().equals("DOCTOR")) {
            this.doctorName = report.getCreatedBy().getName();
        } else {
        this.doctorName = null;
    }

this.testName = report.getTestName();
this.result = report.getResult();
this.reportDate = report.getReportDate();
this.fileReference = report.getFileReference();
}

public Long getLabReportId() {
    return labReportId;
}

public Long getPatientId() {
    return patientId;
}

public String getPatientName() {
    return patientName;
}

public Long getCreatedByUserId() {
    return createdByUserId;
}

public String getCreatedByName() {
    return createdByName;
}

public String getCreatedByRole() {
    return createdByRole;
}

public String getDoctorName() {
    return doctorName;
}

public String getTestName() {
    return testName;
}

public String getResult() {
    return result;
}

public LocalDateTime getReportDate() {
    return reportDate;
}

public String getFileReference() {
    return fileReference;
}
}
