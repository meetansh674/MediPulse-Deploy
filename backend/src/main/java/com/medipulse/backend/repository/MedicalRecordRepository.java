package com.medipulse.backend.repository;

import com.medipulse.backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository
extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientUserId(Long patientId);

    List<MedicalRecord> findByDoctorDoctorId(Long doctorId);
}
