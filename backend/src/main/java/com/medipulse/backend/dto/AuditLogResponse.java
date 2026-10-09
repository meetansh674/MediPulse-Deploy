package com.medipulse.backend.dto;

import com.medipulse.backend.entity.AuditLog;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long auditId;
    private Long actorId;
    private String actorEmail;
    private String action;
    private String targetType;
    private Long targetId;
    private String detail;
    private LocalDateTime createdAt;

    public AuditLogResponse() {
    }

    public AuditLogResponse(AuditLog log) {
        this.auditId = log.getAuditId();
        this.actorId = log.getActorId();
        this.actorEmail = log.getActorEmail();
        this.action = log.getAction();
        this.targetType = log.getTargetType();
        this.targetId = log.getTargetId();
        this.detail = log.getDetail();
        this.createdAt = log.getCreatedAt();
    }

    public Long getAuditId() {
        return auditId;
    }

    public Long getActorId() {
        return actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getAction() {
        return action;
    }

    public String getTargetType() {
        return targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getDetail() {
        return detail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
