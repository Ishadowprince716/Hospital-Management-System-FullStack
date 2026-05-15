CREATE TABLE IF NOT EXISTS clinical_handoffs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT NOT NULL,
    patient_name VARCHAR(160) NOT NULL,
    location VARCHAR(80),
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    summary VARCHAR(1200) NOT NULL,
    next_action VARCHAR(800),
    watch_flags VARCHAR(800),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_clinical_handoffs_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clinical_handoffs_creator_updated ON clinical_handoffs(created_by, updated_at);
CREATE INDEX idx_clinical_handoffs_status_priority ON clinical_handoffs(status, priority);
