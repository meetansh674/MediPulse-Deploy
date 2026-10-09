package com.medipulse.backend.controller;
import com.medipulse.backend.dto.UserResponse;
import com.medipulse.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") public class MeController { private final UserService userService; public MeController(UserService s){userService=s;} @GetMapping("/me") @PreAuthorize("isAuthenticated()") public ResponseEntity<UserResponse> me(Authentication a){return ResponseEntity.ok(new UserResponse(userService.getUserById((Long)a.getPrincipal()).orElseThrow()));} }
