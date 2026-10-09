package com.medipulse.backend.dto;

public class AdminDoctorUpdateRequest {

    private String name;
    private String phone;
    private String specialization;
    private String department;

    public AdminDoctorUpdateRequest() {
    }

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public String getPhone() {
    return phone;
}

public void setPhone(String phone) {
    this.phone = phone;
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
