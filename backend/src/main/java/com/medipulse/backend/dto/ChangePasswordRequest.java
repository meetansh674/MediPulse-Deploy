package com.medipulse.backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public class ChangePasswordRequest { @NotBlank private String currentPassword; @NotBlank @Size(min=8) @Pattern(regexp=".*[^A-Za-z0-9].*",message="Password must contain at least one special character") private String newPassword; public String getCurrentPassword(){return currentPassword;} public void setCurrentPassword(String v){currentPassword=v;} public String getNewPassword(){return newPassword;} public void setNewPassword(String v){newPassword=v;} }
