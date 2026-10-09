package com.medipulse.backend.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public class ProfileUpdateRequest { @NotBlank private String name; @NotBlank @Email private String email; private String phone; public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;} }
