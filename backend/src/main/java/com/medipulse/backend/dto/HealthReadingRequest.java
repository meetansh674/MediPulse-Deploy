package com.medipulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class HealthReadingRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String readingType;

    @NotBlank
    private String value;

    private String unit;

    @NotNull
    private LocalDateTime recordedAt;

    public HealthReadingRequest() {
    }

public Long getPatientId() {
    return patientId;
}

public void setPatientId(Long patientId) {
    this.patientId = patientId;
}

public String getReadingType() {
    return readingType;
}

public void setReadingType(String readingType) {
    this.readingType = readingType;
}

public String getValue() {
    return value;
}

public void setValue(String value) {
    this.value = value;
}

public String getUnit() {
    return unit;
}

public void setUnit(String unit) {
    this.unit = unit;
}

public LocalDateTime getRecordedAt() {
    return recordedAt;
}

public void setRecordedAt(LocalDateTime recordedAt) {
    this.recordedAt = recordedAt;
}
}
