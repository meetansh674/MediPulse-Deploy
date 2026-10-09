package com.medipulse.backend.dto;

import com.medipulse.backend.entity.User;

import java.time.LocalDateTime;

public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private User.Role role;
    private String phone;
    private boolean active;
    private boolean treatmentCompleted;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

public UserResponse(User user) {
    this.userId = user.getUserId();
    this.name = user.getName();
    this.email = user.getEmail();
    this.role = user.getRole();
    this.phone = user.getPhone();
    this.active = user.isActive();
    this.treatmentCompleted = user.isTreatmentCompleted();
    this.createdAt = user.getCreatedAt();
}

public Long getUserId() {
    return userId;
}

public String getName() {
    return name;
}

public String getEmail() {
    return email;
}

public User.Role getRole() {
    return role;
}

public String getPhone() {
    return phone;
}

public boolean isActive() {
    return active;
}

public boolean isTreatmentCompleted() {
    return treatmentCompleted;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}
}
