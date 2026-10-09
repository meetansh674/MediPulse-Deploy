package com.medipulse.backend.repository;

import com.medipulse.backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository
extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientUserId(Long patientId);
}
