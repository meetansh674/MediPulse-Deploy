package com.medipulse.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordQuestionRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    public ForgotPasswordQuestionRequest() {
    }

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}
}
