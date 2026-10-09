package com.medipulse.backend.dto;

import com.medipulse.backend.entity.HealthReading;

import java.time.LocalDateTime;

public class HealthReadingResponse {

    private Long readingId;
    private Long patientId;
    private String patientName;
    private String readingType;
    private String value;
    private String unit;
    private LocalDateTime recordedAt;

    public HealthReadingResponse(HealthReading reading) {
        this.readingId = reading.getReadingId();
        this.patientId = reading.getPatient().getUserId();
        this.patientName = reading.getPatient().getName();
        this.readingType = reading.getReadingType();
        this.value = reading.getValue();
        this.unit = reading.getUnit();
        this.recordedAt = reading.getRecordedAt();
    }

public Long getReadingId() {
    return readingId;
}

public Long getPatientId() {
    return patientId;
}

public String getPatientName() {
    return patientName;
}

public String getReadingType() {
    return readingType;
}

public String getValue() {
    return value;
}

public String getUnit() {
    return unit;
}

public LocalDateTime getRecordedAt() {
    return recordedAt;
}
}
