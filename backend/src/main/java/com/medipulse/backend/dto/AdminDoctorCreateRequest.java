package com.medipulse.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminDoctorCreateRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
    regexp = ".*[^A-Za-z0-9].*",
    message = "Password must contain at least one special character"
    )
    private String password;

    private String phone;

    @NotBlank
    private String specialization;

    @NotBlank
    private String department;

    public AdminDoctorCreateRequest() {
    }

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}

public String getPassword() {
    return password;
}

public void setPassword(String password) {
    this.password = password;
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
