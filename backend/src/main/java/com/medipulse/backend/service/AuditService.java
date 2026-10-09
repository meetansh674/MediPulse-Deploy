package com.medipulse.backend.service;

import com.medipulse.backend.entity.AuditLog;
import com.medipulse.backend.repository.AuditLogRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void log(String action, String targetType, Long targetId, String detail) {
        try {
            Long actorId = null;
            String actorEmail = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && authentication.getPrincipal() instanceof Long id) {
                actorId = id;
                actorEmail = userRepository.findById(id).map(u -> u.getEmail()).orElse(null);
            }
            AuditLog entry = new AuditLog();
            entry.setActorId(actorId);
            entry.setActorEmail(actorEmail);
            entry.setAction(action);
            entry.setTargetType(targetType);
            entry.setTargetId(targetId);
            entry.setDetail(detail);
            entry.setCreatedAt(LocalDateTime.now());
            auditLogRepository.save(entry);
        } catch (Exception ignored) {
            // Auditing must never break the primary action.
        }
    }

    public List<AuditLog> recent() {
        return auditLogRepository.findTop500ByOrderByCreatedAtDesc();
    }
}
