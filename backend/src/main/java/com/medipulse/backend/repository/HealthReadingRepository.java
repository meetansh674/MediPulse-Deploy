package com.medipulse.backend.repository;

import com.medipulse.backend.entity.HealthReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthReadingRepository
extends JpaRepository<HealthReading, Long> {

    List<HealthReading> findByPatientUserIdOrderByRecordedAtDesc(Long patientId);
}
