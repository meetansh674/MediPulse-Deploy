package com.medipulse.backend.repository;

import com.medipulse.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository
extends JpaRepository<Alert, Long> {

    List<Alert> findByPatientUserIdOrderByCreatedAtDesc(Long patientId);

    long countByStatusIn(java.util.Collection<Alert.Status> statuses);
}
