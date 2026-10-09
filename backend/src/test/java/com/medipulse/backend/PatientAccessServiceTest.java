package com.medipulse.backend;

import com.medipulse.backend.entity.Appointment;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.repository.AppointmentRepository;
import com.medipulse.backend.service.PatientAccessService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PatientAccessServiceTest {
    @Test void cancelledAppointmentDoesNotAuthorizeDoctorAccess(){
        AppointmentRepository repository=mock(AppointmentRepository.class);
        when(repository.existsByDoctorDoctorIdAndPatientUserIdAndStatusNot(7L,11L,Appointment.Status.CANCELLED)).thenReturn(false);
        PatientAccessService service=new PatientAccessService(repository);
        User doctor=new User(); doctor.setUserId(7L); doctor.setRole(User.Role.DOCTOR);
        assertThrows(ForbiddenException.class,()->service.assertCanAccessPatient(doctor,11L));
    }
}
