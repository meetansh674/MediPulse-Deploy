package com.medipulse.backend;

import com.medipulse.backend.dto.AppointmentRequest;
import com.medipulse.backend.entity.Appointment;
import com.medipulse.backend.entity.Doctor;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ConflictException;
import com.medipulse.backend.repository.AppointmentRepository;
import com.medipulse.backend.repository.DoctorRepository;
import com.medipulse.backend.repository.UserRepository;
import com.medipulse.backend.service.AppointmentService;
import com.medipulse.backend.service.AuditService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {
    private final AppointmentRepository appointments = mock(AppointmentRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final DoctorRepository doctors = mock(DoctorRepository.class);
    private final AuditService audit = mock(AuditService.class);
    private final AppointmentService service = new AppointmentService(appointments, users, doctors, audit);

    @AfterEach void clearSecurity(){ SecurityContextHolder.clearContext(); }

    @Test void rejectsPastAppointment(){
        User patient = patient(); authenticate(patient);
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(2L); request.setAppointmentDate(LocalDateTime.now().minusMinutes(1)); request.setReason("Check-up");
        assertThrows(IllegalArgumentException.class, () -> service.createAppointment(request));
        verifyNoInteractions(doctors);
    }

@Test void rejectsDoubleBooking(){
    User patient = patient(); authenticate(patient);
    Doctor doctor = new Doctor(); doctor.setDoctorId(2L);
    when(doctors.findById(2L)).thenReturn(Optional.of(doctor));
    when(appointments.existsByDoctorDoctorIdAndAppointmentDateAndStatusNot(eq(2L), any(LocalDateTime.class), eq(Appointment.Status.CANCELLED))).thenReturn(true);
    AppointmentRequest request = new AppointmentRequest();
    request.setDoctorId(2L); request.setAppointmentDate(LocalDateTime.now().plusHours(2)); request.setReason("Check-up");
    assertThrows(ConflictException.class, () -> service.createAppointment(request));
    verify(appointments, never()).save(any());
}

private User patient(){ User p=new User(); p.setUserId(1L); p.setRole(User.Role.PATIENT); when(users.findById(1L)).thenReturn(Optional.of(p)); return p; }
private void authenticate(User p){ SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(p.getUserId(), null, List.of())); }
}
