CREATE TABLE IF NOT EXISTS referral_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    referring_doctor_id BIGINT NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'ROUTINE',
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    reason VARCHAR(1200) NOT NULL,
    notes VARCHAR(1200),
    preferred_date DATE,
    coordinator_note VARCHAR(1200),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_referral_requests_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_referral_requests_doctor FOREIGN KEY (referring_doctor_id) REFERENCES doctors(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_referral_requests_patient_updated ON referral_requests(patient_id, updated_at);
CREATE INDEX idx_referral_requests_doctor_updated ON referral_requests(referring_doctor_id, updated_at);
CREATE INDEX idx_referral_requests_status_priority ON referral_requests(status, priority);
