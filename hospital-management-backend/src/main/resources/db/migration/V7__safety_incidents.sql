CREATE TABLE IF NOT EXISTS safety_incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reported_by BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    category VARCHAR(60) NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    description VARCHAR(1200) NOT NULL,
    patient_identifier VARCHAR(120),
    location VARCHAR(120),
    corrective_action VARCHAR(1200),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_safety_incidents_reporter FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_safety_incidents_reporter_updated ON safety_incidents(reported_by, updated_at);
CREATE INDEX idx_safety_incidents_status_severity ON safety_incidents(status, severity);
