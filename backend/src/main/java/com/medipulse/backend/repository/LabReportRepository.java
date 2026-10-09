package com.medipulse.backend.repository;

import com.medipulse.backend.entity.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabReportRepository
extends JpaRepository<LabReport, Long> {

    List<LabReport> findByPatientUserId(Long patientId);

    Optional<LabReport> findFirstByFileReference(String fileReference);
}
