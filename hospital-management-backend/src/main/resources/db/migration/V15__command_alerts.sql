CREATE TABLE IF NOT EXISTS command_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(120) NOT NULL,
    patient_name VARCHAR(180),
    patient_identifier VARCHAR(120),
    severity VARCHAR(40) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    owner_name VARCHAR(180),
    sla_minutes INT DEFAULT 30,
    recommended_action TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_command_alerts_status ON command_alerts(status);
CREATE INDEX idx_command_alerts_severity ON command_alerts(severity);
CREATE INDEX idx_command_alerts_department ON command_alerts(department);
