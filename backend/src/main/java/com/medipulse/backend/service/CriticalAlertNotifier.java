package com.medipulse.backend.service;

import com.medipulse.backend.entity.Alert;
import com.medipulse.backend.entity.Appointment;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.repository.AlertRepository;
import com.medipulse.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CriticalAlertNotifier {

    private final AppointmentRepository appointmentRepository;
    private final AlertRepository alertRepository;

    private final boolean mailEnabled;
    private final String smtpHost;
    private final int smtpPort;
    private final boolean smtpSsl;
    private final boolean smtpStarttls;
    private final String smtpUsername;
    private final String smtpPassword;
    private final String mailFrom;
    private final long cooldownMinutes;

    public CriticalAlertNotifier(
            AppointmentRepository appointmentRepository,
            AlertRepository alertRepository,
            @Value("${app.alerts.mail-enabled:false}") boolean mailEnabled,
            @Value("${app.alerts.smtp-host:}") String smtpHost,
            @Value("${app.alerts.smtp-port:587}") int smtpPort,
            @Value("${app.alerts.smtp-ssl:false}") boolean smtpSsl,
            @Value("${app.alerts.smtp-starttls:true}") boolean smtpStarttls,
            @Value("${app.alerts.smtp-username:}") String smtpUsername,
            @Value("${app.alerts.smtp-password:}") String smtpPassword,
            @Value("${app.alerts.mail-from:MediPulse <noreply@medipulse.local>}") String mailFrom,
            @Value("${app.alerts.mail-cooldown-minutes:60}") long cooldownMinutes) {
        this.appointmentRepository = appointmentRepository;
        this.alertRepository = alertRepository;
        this.mailEnabled = mailEnabled;
        this.smtpHost = smtpHost == null ? "" : smtpHost.trim();
        this.smtpPort = smtpPort;
        this.smtpSsl = smtpSsl;
        this.smtpStarttls = smtpStarttls;
        this.smtpUsername = smtpUsername;
        this.smtpPassword = smtpPassword;
        this.mailFrom = mailFrom;
        this.cooldownMinutes = cooldownMinutes;
    }

    @Async
    public void notifyAttention(User patient, Alert alert) {
        try {
            List<String> doctors = appointmentRepository
                    .findByPatientUserIdOrderByAppointmentDateDesc(patient.getUserId())
                    .stream()
                    .filter(a -> a.getStatus() != Appointment.Status.CANCELLED)
                    .map(a -> a.getDoctor().getUser().getEmail())
                    .filter(email -> email != null && !email.isBlank())
                    .distinct()
                    .sorted()
                    .toList();
            if (doctors.isEmpty()) {
                System.out.println(">>> [MediPulse] ATTENTION alert for " + patient.getEmail()
                        + " has no linked doctor to notify.");
                return;
            }
            if (recentlyNotified(patient.getUserId(), alert.getAlertId())) {
                System.out.println(">>> [MediPulse] ATTENTION mail skipped for " + patient.getEmail()
                        + " (cooldown " + cooldownMinutes + "m).");
                return;
            }
            String subject = "MediPulse ATTENTION: " + patient.getName() + " needs review";
            String body = "A critical health reading was recorded and needs clinical review.\n\n"
                    + "Patient: " + patient.getName() + " (ID " + patient.getUserId() + ")\n"
                    + "Alert: " + alert.getMessage() + "\n"
                    + "Recorded: " + alert.getCreatedAt() + "\n\n"
                    + "Open the MediPulse doctor portal to review and resolve this alert.\n"
                    + "These flags are not medical diagnoses.";
            if (!mailEnabled || smtpHost.isEmpty()) {
                System.out.println(">>> [MediPulse] Mail disabled; ATTENTION for " + patient.getEmail()
                        + " would notify " + doctors + ": " + alert.getMessage());
                return;
            }
            SmtpMailSender.send(smtpHost, smtpPort, smtpSsl, smtpStarttls,
                    smtpUsername, smtpPassword, mailFrom, doctors, subject, body);
            System.out.println(">>> [MediPulse] ATTENTION mail sent for " + patient.getEmail()
                    + " to " + doctors);
        } catch (Exception e) {
            System.out.println(">>> [MediPulse] ATTENTION mail failed for " + patient.getEmail()
                    + ": " + e.getMessage());
        }
    }

    private boolean recentlyNotified(Long patientId, Long currentAlertId) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(cooldownMinutes);
        return alertRepository.findByPatientUserIdOrderByCreatedAtDesc(patientId).stream()
                .filter(a -> !a.getAlertId().equals(currentAlertId))
                .filter(a -> a.getStatus() == Alert.Status.ATTENTION)
                .filter(a -> !a.isResolved())
                .anyMatch(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(cutoff));
    }
}
