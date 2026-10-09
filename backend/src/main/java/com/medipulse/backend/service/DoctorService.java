package com.medipulse.backend.service;

import com.medipulse.backend.dto.DoctorSelfUpdateRequest;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.AppointmentRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository, AppointmentRepository appointmentRepository) { this.doctorRepository=doctorRepository; this.userRepository=userRepository; this.appointmentRepository=appointmentRepository; }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

public Optional<Doctor> getDoctorById(Long doctorId) {
    return doctorRepository.findById(doctorId);
}

public List<User> getAuthorizedPatients(Long doctorId) {
    return appointmentRepository.findByDoctorDoctorIdOrderByAppointmentDateDesc(doctorId).stream().filter(a -> a.getStatus() != com.medipulse.backend.entity.Appointment.Status.CANCELLED).map(a -> a.getPatient()).filter(User::isActive).collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toMap(User::getUserId,u->u,(a,b)->a,java.util.LinkedHashMap::new),m->new java.util.ArrayList<>(m.values())));
}

@Transactional
public Doctor updateOwnProfile(DoctorSelfUpdateRequest request) {
    User currentUser = getCurrentUser();

    if (currentUser.getRole() != User.Role.DOCTOR) {
        throw new ForbiddenException("Only doctors can update this profile");
    }

Doctor doctor = doctorRepository.findById(currentUser.getUserId())
.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

if (request.getPhone() != null) {
    String phone = request.getPhone().trim();
    currentUser.setPhone(phone.isEmpty() ? null : phone);
    userRepository.save(currentUser);
}

return doctor;
}

private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null ||
    !authentication.isAuthenticated() ||
    !(authentication.getPrincipal() instanceof Long currentUserId)) {
        throw new ForbiddenException("User not authenticated");
    }

return userRepository.findById(currentUserId)
.orElseThrow(() -> new ForbiddenException("Authenticated user not found"));
}
}
