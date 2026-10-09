package com.medipulse.backend.controller;
import com.medipulse.backend.dto.*;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/users") public class UserController {
    private final UserService userService; public UserController(UserService s){userService=s;}
    @GetMapping @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<UserResponse>> getAllUsers(){return ResponseEntity.ok(userService.getAllUsers().stream().map(UserResponse::new).toList());}
    @GetMapping("/me") @PreAuthorize("isAuthenticated()") public ResponseEntity<UserResponse> me(Authentication a){return ResponseEntity.ok(new UserResponse(userService.getUserById((Long)a.getPrincipal()).orElseThrow()));}
    @PutMapping("/me") @PreAuthorize("isAuthenticated()") public ResponseEntity<UserResponse> update(@Valid @RequestBody ProfileUpdateRequest r,Authentication a){return ResponseEntity.ok(new UserResponse(userService.updateCurrentProfile((Long)a.getPrincipal(),r)));}
    @PutMapping("/me/password") @PreAuthorize("isAuthenticated()") public ResponseEntity<Void> password(@Valid @RequestBody ChangePasswordRequest r,Authentication a){userService.changePassword((Long)a.getPrincipal(),r);return ResponseEntity.noContent().build();}
    @PatchMapping("/{id}/status") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<UserResponse> status(@PathVariable Long id,@RequestParam boolean active){return ResponseEntity.ok(new UserResponse(userService.setActive(id,active)));}
    @PatchMapping("/{id}/treatment") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<UserResponse> treatment(@PathVariable Long id,@RequestParam boolean completed){return ResponseEntity.ok(new UserResponse(userService.setTreatmentCompleted(id,completed)));}
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> delete(@PathVariable Long id){userService.deleteUser(id);return ResponseEntity.noContent().build();}
}
