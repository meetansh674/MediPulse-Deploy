package com.medipulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;

    @Column(name = "security_question")
    private String securityQuestion;

    @Column(name = "security_answer")
    private String securityAnswer;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    @Column(name = "treatment_completed", nullable = false, columnDefinition = "boolean default false")
    private boolean treatmentCompleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum Role {
        PATIENT,
        DOCTOR,
        ADMIN
    }

public User() {
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
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

public Role getRole() {
    return role;
}

public void setRole(Role role) {
    this.role = role;
}

public String getPhone() {
    return phone;
}

public void setPhone(String phone) {
    this.phone = phone;
}

public String getSecurityQuestion() {
    return securityQuestion;
}

public void setSecurityQuestion(String securityQuestion) {
    this.securityQuestion = securityQuestion;
}

public String getSecurityAnswer() {
    return securityAnswer;
}

public void setSecurityAnswer(String securityAnswer) {
    this.securityAnswer = securityAnswer;
}

public boolean isActive() {
    return active;
}

public void setActive(boolean active) {
    this.active = active;
}

public boolean isTreatmentCompleted() {
    return treatmentCompleted;
}

public void setTreatmentCompleted(boolean treatmentCompleted) {
    this.treatmentCompleted = treatmentCompleted;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}
}
