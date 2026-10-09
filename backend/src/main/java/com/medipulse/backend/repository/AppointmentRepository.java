package com.medipulse.backend.repository;

import com.medipulse.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientUserIdOrderByAppointmentDateDesc(Long patientId);

    List<Appointment> findByDoctorDoctorIdOrderByAppointmentDateDesc(Long doctorId);

    boolean existsByDoctorDoctorIdAndPatientUserId(Long doctorId, Long patientId);

    boolean existsByDoctorDoctorIdAndPatientUserIdAndStatusNot(Long doctorId, Long patientId, Appointment.Status status);

    boolean existsByDoctorDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, java.time.LocalDateTime appointmentDate, Appointment.Status status);

    boolean existsByDoctorDoctorIdAndAppointmentDateAndStatusNotAndAppointmentIdNot(Long doctorId, java.time.LocalDateTime appointmentDate, Appointment.Status status, Long appointmentId);
}
