package com.medipulse.backend.service;

import com.medipulse.backend.dto.AdminDoctorCreateRequest;
import com.medipulse.backend.dto.AdminDoctorUpdateRequest;
import com.medipulse.backend.dto.AdminStatsResponse;
import com.medipulse.backend.entity.AuditLog;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ConflictException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.AlertRepository;
import com.medipulse.backend.repository.AppointmentRepository;
import com.medipulse.backend.repository.AuditLogRepository;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.HealthReadingRepository;
import com.medipulse.backend.repository.LabReportRepository;
import com.medipulse.backend.repository.MedicalRecordRepository;
import com.medipulse.backend.repository.PrescriptionRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabReportRepository labReportRepository;
    private final HealthReadingRepository healthReadingRepository;
    private final AlertRepository alertRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AdminService(
    UserRepository userRepository,
    DoctorRepository doctorRepository,
    AppointmentRepository appointmentRepository,
    MedicalRecordRepository medicalRecordRepository,
    PrescriptionRepository prescriptionRepository,
    LabReportRepository labReportRepository,
    HealthReadingRepository healthReadingRepository,
    AlertRepository alertRepository,
    AuditLogRepository auditLogRepository,
    PasswordEncoder passwordEncoder,
    AuditService auditService) {

        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labReportRepository = labReportRepository;
        this.healthReadingRepository = healthReadingRepository;
        this.alertRepository = alertRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

public List<AuditLog> getAuditLog() {
    return auditLogRepository.findTop500ByOrderByCreatedAtDesc();
}

public AdminStatsResponse getStatistics() {

    long totalUsers = userRepository.count();
    long totalPatients = userRepository.countByRole(User.Role.PATIENT);
    long totalDoctors = doctorRepository.count();
    long totalAppointments = appointmentRepository.count();
    long totalMedicalRecords = medicalRecordRepository.count();
    long totalPrescriptions = prescriptionRepository.count();
    long totalLabReports = labReportRepository.count();
    long totalHealthReadings = healthReadingRepository.count();
    long totalAlerts = alertRepository.count();

    return new AdminStatsResponse(
    totalUsers,
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalMedicalRecords,
    totalPrescriptions,
    totalLabReports,
    totalHealthReadings,
    totalAlerts
    );
}

@Transactional
public Doctor createDoctor(AdminDoctorCreateRequest request) {
    String email = normalizeEmail(request.getEmail());

    if (userRepository.existsByEmail(email)) {
        throw new ConflictException("Email already registered");
    }

User user = new User();
user.setName(request.getName().trim());
user.setEmail(email);
user.setPassword(passwordEncoder.encode(request.getPassword()));
user.setRole(User.Role.DOCTOR);
user.setPhone(normalizeOptional(request.getPhone()));
user.setCreatedAt(LocalDateTime.now());

User savedUser = userRepository.save(user);

Doctor doctor = new Doctor();
doctor.setUser(savedUser);
doctor.setSpecialization(requireNonBlank(
request.getSpecialization(), "Specialization"));
doctor.setDepartment(requireNonBlank(
request.getDepartment(), "Department"));

Doctor saved = doctorRepository.save(doctor);
auditService.log("DOCTOR_CREATED", "DOCTOR", saved.getDoctorId(), email);
return saved;
}

@Transactional
public Doctor updateDoctor(Long doctorId, AdminDoctorUpdateRequest request) {
    Doctor doctor = doctorRepository.findById(doctorId)
    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

    User user = doctor.getUser();

    if (request.getName() != null) {
        user.setName(requireNonBlank(request.getName(), "Name"));
    }

if (request.getPhone() != null) {
    user.setPhone(normalizeOptional(request.getPhone()));
}

if (request.getSpecialization() != null) {
    doctor.setSpecialization(requireNonBlank(
    request.getSpecialization(), "Specialization"));
}

if (request.getDepartment() != null) {
    doctor.setDepartment(requireNonBlank(
    request.getDepartment(), "Department"));
}

userRepository.save(user);
Doctor saved = doctorRepository.save(doctor);
auditService.log("DOCTOR_UPDATED", "DOCTOR", doctorId, user.getEmail());
return saved;
}

private String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase();
}

private String normalizeOptional(String value) {
    if (value == null) {
        return null;
    }
String trimmed = value.trim();
return trimmed.isEmpty() ? null : trimmed;
}

private String requireNonBlank(String value, String fieldName) {
    if (value == null || value.trim().isEmpty()) {
        throw new IllegalArgumentException(fieldName + " cannot be blank");
    }
return value.trim();
}
}
