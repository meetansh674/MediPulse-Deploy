package com.medipulse.backend.service;

import com.medipulse.backend.dto.RegisterRequest;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ConflictException;
import com.medipulse.backend.exception.UnauthorizedException;
import com.medipulse.backend.dto.ProfileUpdateRequest;
import com.medipulse.backend.dto.ChangePasswordRequest;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

public User createUser(RegisterRequest request) {
    String email = normalizeEmail(request.getEmail());

    if (userRepository.existsByEmail(email)) {
        throw new ConflictException("Email already registered");
    }

User user = new User();
user.setName(request.getName().trim());
user.setEmail(email);
user.setPassword(passwordEncoder.encode(request.getPassword()));

user.setRole(User.Role.PATIENT);

user.setPhone(request.getPhone());
if (request.getSecurityQuestion() != null && !request.getSecurityQuestion().isBlank()
&& request.getSecurityAnswer() != null && !request.getSecurityAnswer().isBlank()) {
    user.setSecurityQuestion(request.getSecurityQuestion().trim());
    user.setSecurityAnswer(passwordEncoder.encode(normalizeAnswer(request.getSecurityAnswer())));
}
user.setCreatedAt(LocalDateTime.now());

return userRepository.save(user);
}

public String getSecurityQuestion(String email) {
    User user = userRepository.findByEmail(normalizeEmail(email))
    .orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("No account found for this email address"));
    if (user.getSecurityQuestion() == null || user.getSecurityAnswer() == null
    || user.getSecurityQuestion().isBlank() || user.getSecurityAnswer().isBlank()) {
        throw new com.medipulse.backend.exception.ResourceNotFoundException(
        "No security question is set for this account. Please contact an administrator.");
    }
return user.getSecurityQuestion();
}

public void resetPasswordWithSecurityAnswer(String email, String securityAnswer, String newPassword) {
    User user = userRepository.findByEmail(normalizeEmail(email))
    .filter(u -> u.getSecurityAnswer() != null && !u.getSecurityAnswer().isBlank())
    .orElseThrow(() -> new UnauthorizedException("Invalid email or security answer"));
    if (!passwordEncoder.matches(normalizeAnswer(securityAnswer), user.getSecurityAnswer())) {
        throw new UnauthorizedException("Invalid email or security answer");
    }
user.setPassword(passwordEncoder.encode(newPassword));
userRepository.save(user);
}

private String normalizeAnswer(String answer) {
    return answer == null ? "" : answer.trim().toLowerCase();
}

public Optional<User> login(String email, String password) {
    Optional<User> user = userRepository.findByEmail(normalizeEmail(email));

    if (user.isPresent() && user.get().isActive() && passwordEncoder.matches(password, user.get().getPassword())) {
        return user;
    }

return Optional.empty();
}

public User updateCurrentProfile(Long userId, ProfileUpdateRequest request) {
    User user = userRepository.findById(userId).orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("User not found"));
    String email=normalizeEmail(request.getEmail());
    userRepository.findByEmail(email).filter(existing -> !existing.getUserId().equals(userId)).ifPresent(existing -> { throw new ConflictException("Email already registered"); });
    user.setName(request.getName().trim()); user.setEmail(email); user.setPhone(request.getPhone()==null||request.getPhone().isBlank()?null:request.getPhone().trim());
    return userRepository.save(user);
}
public void changePassword(Long userId, ChangePasswordRequest request) {
    User user=userRepository.findById(userId).orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("User not found"));
    if(!passwordEncoder.matches(request.getCurrentPassword(),user.getPassword())) throw new UnauthorizedException("Current password is incorrect");
    user.setPassword(passwordEncoder.encode(request.getNewPassword())); userRepository.save(user);
}
public User setActive(Long userId, boolean active) { User user=userRepository.findById(userId).orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("User not found")); if(user.getRole()==User.Role.ADMIN) throw new ConflictException("Administrator accounts cannot be disabled"); user.setActive(active); User saved=userRepository.save(user); auditService.log(active ? "USER_ENABLED" : "USER_DISABLED", "USER", userId, user.getEmail()); return saved; }
public User setTreatmentCompleted(Long userId, boolean completed) { User user=userRepository.findById(userId).orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("User not found")); if(user.getRole()==User.Role.ADMIN) throw new ConflictException("Treatment status cannot be changed for administrator accounts"); user.setTreatmentCompleted(completed); User saved=userRepository.save(user); auditService.log(completed ? "TREATMENT_MARKED_DONE" : "TREATMENT_REOPENED", "USER", userId, user.getEmail()); return saved; }
public void deleteUser(Long userId) { User user=userRepository.findById(userId).orElseThrow(() -> new com.medipulse.backend.exception.ResourceNotFoundException("User not found")); if(user.getRole()==User.Role.ADMIN) throw new ConflictException("Administrator accounts cannot be deleted"); String email=user.getEmail(); userRepository.delete(user); auditService.log("USER_DELETED", "USER", userId, email); }

public Optional<User> getUserByEmail(String email) {
    return userRepository.findByEmail(normalizeEmail(email));
}

public Optional<User> getUserById(Long userId) {
    return userRepository.findById(userId);
}

public List<User> getAllUsers() {
    return userRepository.findAll();
}

private String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase();
}
}
