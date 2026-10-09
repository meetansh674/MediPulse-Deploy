package com.medipulse.backend.dto;

public class AdminStatsResponse {

    private long totalUsers;
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long totalMedicalRecords;
    private long totalPrescriptions;
    private long totalLabReports;
    private long totalHealthReadings;
    private long totalAlerts;

    public AdminStatsResponse(
    long totalUsers,
    long totalPatients,
    long totalDoctors,
    long totalAppointments,
    long totalMedicalRecords,
    long totalPrescriptions,
    long totalLabReports,
    long totalHealthReadings,
    long totalAlerts) {

        this.totalUsers = totalUsers;
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalAppointments = totalAppointments;
        this.totalMedicalRecords = totalMedicalRecords;
        this.totalPrescriptions = totalPrescriptions;
        this.totalLabReports = totalLabReports;
        this.totalHealthReadings = totalHealthReadings;
        this.totalAlerts = totalAlerts;
    }

public long getTotalUsers() {
    return totalUsers;
}

public long getTotalPatients() {
    return totalPatients;
}

public long getTotalDoctors() {
    return totalDoctors;
}

public long getTotalAppointments() {
    return totalAppointments;
}

public long getTotalMedicalRecords() {
    return totalMedicalRecords;
}

public long getTotalPrescriptions() {
    return totalPrescriptions;
}

public long getTotalLabReports() {
    return totalLabReports;
}

public long getTotalHealthReadings() {
    return totalHealthReadings;
}

public long getTotalAlerts() {
    return totalAlerts;
}
}
