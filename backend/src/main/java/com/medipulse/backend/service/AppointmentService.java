package com.medipulse.backend.service;

import com.medipulse.backend.dto.AppointmentRequest;
import com.medipulse.backend.dto.AppointmentUpdateRequest;
import com.medipulse.backend.entity.Appointment;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ConflictException;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.AppointmentRepository;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService auditService;
    public AppointmentService(AppointmentRepository appointmentRepository, UserRepository userRepository, DoctorRepository doctorRepository, AuditService auditService) {
        this.appointmentRepository=appointmentRepository; this.userRepository=userRepository; this.doctorRepository=doctorRepository; this.auditService=auditService;
    }
public List<Appointment> getVisibleAppointments() {
    User u=getCurrentUser();
    return switch(u.getRole()) {
        case PATIENT -> appointmentRepository.findByPatientUserIdOrderByAppointmentDateDesc(u.getUserId());
        case DOCTOR -> appointmentRepository.findByDoctorDoctorIdOrderByAppointmentDateDesc(u.getUserId());
        case ADMIN -> appointmentRepository.findAll();
    };
}
public Appointment getVisibleAppointmentById(Long id) {
    Appointment a=appointmentRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Appointment not found"));
    ensureCanView(a,getCurrentUser()); return a;
}
public Appointment createAppointment(AppointmentRequest request) {
    User patient=getAuthenticatedPatient();
    validateDate(request.getAppointmentDate());
    Doctor doctor=doctorRepository.findById(request.getDoctorId()).orElseThrow(()->new ResourceNotFoundException("Doctor not found"));
    ensureSlotAvailable(doctor.getDoctorId(), request.getAppointmentDate(), null);
    Appointment a=new Appointment(); a.setPatient(patient); a.setDoctor(doctor); a.setAppointmentDate(request.getAppointmentDate()); a.setReason(request.getReason().trim()); a.setStatus(Appointment.Status.SCHEDULED);
    return appointmentRepository.save(a);
}
public Appointment updateAppointment(Long id, AppointmentUpdateRequest request) {
    Appointment a=appointmentRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Appointment not found"));
    User u=getCurrentUser();
    switch(u.getRole()) {
        case PATIENT -> {
            if(!a.getPatient().getUserId().equals(u.getUserId())) throw new ForbiddenException("You are not allowed to modify this appointment");
            if(request.getStatus()!=null) throw new ForbiddenException("Patients cannot change appointment status");
            if(a.getStatus()==Appointment.Status.CANCELLED) throw new ConflictException("Cancelled appointments cannot be rescheduled");
            applyAppointmentChanges(a,request);
        }
    case DOCTOR -> {
        if(!a.getDoctor().getDoctorId().equals(u.getUserId())) throw new ForbiddenException("Only the assigned doctor can update this appointment");
        if(request.getDoctorId()!=null||request.getAppointmentDate()!=null||request.getReason()!=null) throw new ForbiddenException("Doctors can only update appointment status");
        if(request.getStatus()==null) throw new IllegalArgumentException("Appointment status is required");
        a.setStatus(request.getStatus());
    }
case ADMIN -> { applyAppointmentChanges(a,request); if(request.getStatus()!=null)a.setStatus(request.getStatus()); }
}
Appointment saved=appointmentRepository.save(a);
auditService.log("APPOINTMENT_UPDATED", "APPOINTMENT", id, "status=" + saved.getStatus());
return saved;
}
public void cancelAppointment(Long id) {
    Appointment a=appointmentRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Appointment not found"));
    User u=getCurrentUser();
    boolean allowed=switch(u.getRole()){case ADMIN->true; case PATIENT->a.getPatient().getUserId().equals(u.getUserId()); case DOCTOR->a.getDoctor().getDoctorId().equals(u.getUserId());};
    if(!allowed) throw new ForbiddenException("You are not allowed to cancel this appointment");
    if(a.getStatus()==Appointment.Status.CANCELLED) return;
    a.setStatus(Appointment.Status.CANCELLED); appointmentRepository.save(a);
    auditService.log("APPOINTMENT_CANCELLED", "APPOINTMENT", id, a.getReason());
}
public void deleteAppointment(Long id){ cancelAppointment(id); }
private void ensureCanView(Appointment a,User u){ boolean allowed=switch(u.getRole()){case ADMIN->true;case PATIENT->a.getPatient().getUserId().equals(u.getUserId());case DOCTOR->a.getDoctor().getDoctorId().equals(u.getUserId());}; if(!allowed)throw new ForbiddenException("You are not allowed to view this appointment"); }
private void applyAppointmentChanges(Appointment a,AppointmentUpdateRequest r){
    if(r.getDoctorId()!=null){ Doctor d=doctorRepository.findById(r.getDoctorId()).orElseThrow(()->new ResourceNotFoundException("Doctor not found")); a.setDoctor(d);}
    if(r.getAppointmentDate()!=null){ validateDate(r.getAppointmentDate()); ensureSlotAvailable(a.getDoctor().getDoctorId(),r.getAppointmentDate(),a.getAppointmentId()); a.setAppointmentDate(r.getAppointmentDate());}
    if(r.getReason()!=null){if(r.getReason().isBlank())throw new IllegalArgumentException("Appointment reason cannot be blank");a.setReason(r.getReason().trim());}
    if(r.getDoctorId()!=null && r.getAppointmentDate()==null) ensureSlotAvailable(a.getDoctor().getDoctorId(),a.getAppointmentDate(),a.getAppointmentId());
}
private void validateDate(LocalDateTime date){if(date==null||!date.isAfter(LocalDateTime.now()))throw new IllegalArgumentException("Appointment date must be in the future");}
private void ensureSlotAvailable(Long doctorId,LocalDateTime date,Long appointmentId){boolean busy=appointmentId==null?appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndStatusNot(doctorId,date,Appointment.Status.CANCELLED):appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndStatusNotAndAppointmentIdNot(doctorId,date,Appointment.Status.CANCELLED,appointmentId);if(busy)throw new ConflictException("This doctor already has an appointment at that time");}
private User getAuthenticatedPatient(){User u=getCurrentUser();if(u.getRole()!=User.Role.PATIENT)throw new ForbiddenException("Only patients can perform this action");return u;}
private User getCurrentUser(){Authentication a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!a.isAuthenticated()||!(a.getPrincipal() instanceof Long id))throw new ForbiddenException("User not authenticated");return userRepository.findById(id).orElseThrow(()->new ForbiddenException("Authenticated user not found"));}
}
