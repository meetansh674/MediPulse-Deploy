package com.medipulse.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @Column(name = "doctor_id")
    private Long doctorId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "doctor_id")
    private User user;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String department;

    public Doctor() {
    }

public Long getDoctorId() {
    return doctorId;
}

public void setDoctorId(Long doctorId) {
    this.doctorId = doctorId;
}

public User getUser() {
    return user;
}

public void setUser(User user) {
    this.user = user;
}

public String getSpecialization() {
    return specialization;
}

public void setSpecialization(String specialization) {
    this.specialization = specialization;
}

public String getDepartment() {
    return department;
}

public void setDepartment(String department) {
    this.department = department;
}
}
