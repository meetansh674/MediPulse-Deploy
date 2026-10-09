CREATE TABLE IF NOT EXISTS audit_log (
    audit_id BIGINT NOT NULL AUTO_INCREMENT,
    actor_id BIGINT NULL,
    actor_email VARCHAR(255) NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(255) NULL,
    target_id BIGINT NULL,
    detail VARCHAR(1000) NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (audit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
