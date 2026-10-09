package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_readings")
public class HealthReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long readingId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(name = "reading_type", nullable = false)
    private String readingType;

    @Column(nullable = false)
    private String value;

    private String unit;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    public HealthReading() {
    }

public Long getReadingId() {
    return readingId;
}

public void setReadingId(Long readingId) {
    this.readingId = readingId;
}

public User getPatient() {
    return patient;
}

public void setPatient(User patient) {
    this.patient = patient;
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
