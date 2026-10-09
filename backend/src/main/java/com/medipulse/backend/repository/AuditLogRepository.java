package com.medipulse.backend.repository;

import com.medipulse.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop500ByOrderByCreatedAtDesc();
}
