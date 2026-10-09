package com.medipulse.backend.service;

import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientAccessService {

    private final AppointmentRepository appointmentRepository;

    public PatientAccessService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

public void assertCanAccessPatient(User currentUser, Long patientId) {
    switch (currentUser.getRole()) {
        case ADMIN -> {
            return;
        }
    case PATIENT -> {
        if (!currentUser.getUserId().equals(patientId)) {
            throw new ForbiddenException("Patients can only access their own medical data");
        }
}
case DOCTOR -> {
    boolean authorized = appointmentRepository
    .existsByDoctorDoctorIdAndPatientUserIdAndStatusNot(currentUser.getUserId(), patientId, com.medipulse.backend.entity.Appointment.Status.CANCELLED);

    if (!authorized) {
        throw new ForbiddenException(
        "Doctor is not authorized to access this patient's medical data"
        );
    }
}
}
}
}
