package com.medipulse.backend.dto;

import com.medipulse.backend.entity.Doctor;

public class DoctorResponse {

    private Long doctorId;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String department;

    public DoctorResponse(Doctor doctor) {
        this.doctorId = doctor.getDoctorId();
        this.name = doctor.getUser().getName();
        this.email = doctor.getUser().getEmail();
        this.phone = doctor.getUser().getPhone();
        this.specialization = doctor.getSpecialization();
        this.department = doctor.getDepartment();
    }

public Long getDoctorId() {
    return doctorId;
}

public String getName() {
    return name;
}

public String getEmail() {
    return email;
}

public String getPhone() {
    return phone;
}

public String getSpecialization() {
    return specialization;
}

public String getDepartment() {
    return department;
}
}
