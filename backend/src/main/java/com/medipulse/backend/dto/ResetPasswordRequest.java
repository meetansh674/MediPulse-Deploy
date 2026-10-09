package com.medipulse.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Security answer is required")
    private String securityAnswer;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
    regexp = ".*[^A-Za-z0-9].*",
    message = "Password must contain at least one special character"
    )
    private String newPassword;

    public ResetPasswordRequest() {
    }

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}

public String getSecurityAnswer() {
    return securityAnswer;
}

public void setSecurityAnswer(String securityAnswer) {
    this.securityAnswer = securityAnswer;
}

public String getNewPassword() {
    return newPassword;
}

public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
}
}
