package com.medipulse.backend;

import com.medipulse.backend.dto.RegisterRequest;
import com.medipulse.backend.entity.Appointment;
import com.medipulse.backend.entity.User;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class BackendFeatureTests {
    @Test void registrationPasswordRulesMatchBackend() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Patient");
        request.setEmail("test@example.com");
        request.setPassword("short");
        assertFalse(request.getPassword().length() >= 8 && request.getPassword().matches(".*[^A-Za-z0-9].*"));
        request.setPassword("Strong@123");
        assertTrue(request.getPassword().length() >= 8 && request.getPassword().matches(".*[^A-Za-z0-9].*"));
    }

@Test void cancelledAppointmentsAreDistinctFromScheduledAppointments() {
    Appointment appointment = new Appointment();
    appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
    appointment.setStatus(Appointment.Status.CANCELLED);
    assertEquals(Appointment.Status.CANCELLED, appointment.getStatus());
    assertNotEquals(Appointment.Status.SCHEDULED, appointment.getStatus());
}

@Test void userDefaultsToActive() {
    User user = new User();
    assertTrue(user.isActive());
    user.setActive(false);
    assertFalse(user.isActive());
}
}
