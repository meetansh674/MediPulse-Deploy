


CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    security_question VARCHAR(255) NULL,
    security_answer VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    treatment_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS doctors (
    doctor_id BIGINT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    PRIMARY KEY (doctor_id),
    CONSTRAINT fk_doctors_user FOREIGN KEY (doctor_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATETIME(6) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    PRIMARY KEY (appointment_id),
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES users (user_id),
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medical_records (
    record_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    treatment VARCHAR(255) NULL,
    record_date DATETIME(6) NOT NULL,
    PRIMARY KEY (record_id),
    CONSTRAINT fk_medical_records_patient FOREIGN KEY (patient_id) REFERENCES users (user_id),
    CONSTRAINT fk_medical_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL,
    instructions VARCHAR(255) NULL,
    PRIMARY KEY (prescription_id),
    CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES users (user_id),
    CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lab_reports (
    lab_report_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    result VARCHAR(255) NOT NULL,
    report_date DATETIME(6) NOT NULL,
    file_reference VARCHAR(255) NULL,
    PRIMARY KEY (lab_report_id),
    CONSTRAINT fk_lab_reports_patient FOREIGN KEY (patient_id) REFERENCES users (user_id),
    CONSTRAINT fk_lab_reports_created_by FOREIGN KEY (created_by) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS health_readings (
    reading_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    reading_type VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NULL,
    recorded_at DATETIME(6) NOT NULL,
    PRIMARY KEY (reading_id),
    CONSTRAINT fk_health_readings_patient FOREIGN KEY (patient_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (alert_id),
    CONSTRAINT fk_alerts_patient FOREIGN KEY (patient_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
