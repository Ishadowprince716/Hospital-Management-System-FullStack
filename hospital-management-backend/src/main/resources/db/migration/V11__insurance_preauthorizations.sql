CREATE TABLE IF NOT EXISTS insurance_preauthorizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    insurance_provider VARCHAR(120) NOT NULL,
    policy_number VARCHAR(120),
    treatment VARCHAR(140) NOT NULL,
    estimated_amount DECIMAL(12,2),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    notes VARCHAR(1200),
    admin_note VARCHAR(1200),
    required_documents VARCHAR(1200),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_insurance_preauth_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_insurance_preauth_patient_updated ON insurance_preauthorizations(patient_id, updated_at);
CREATE INDEX idx_insurance_preauth_status_priority ON insurance_preauthorizations(status, priority);
