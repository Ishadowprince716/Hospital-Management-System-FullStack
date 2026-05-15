CREATE TABLE IF NOT EXISTS medication_refill_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    medication_name VARCHAR(140) NOT NULL,
    dosage VARCHAR(100),
    last_prescription_ref VARCHAR(120),
    quantity VARCHAR(80),
    preferred_pickup_date DATE,
    delivery_option VARCHAR(30) NOT NULL DEFAULT 'PICKUP',
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    notes VARCHAR(1200),
    pharmacist_note VARCHAR(1200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_refill_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);

CREATE INDEX idx_refill_patient_updated ON medication_refill_requests(patient_id, updated_at);
CREATE INDEX idx_refill_status_priority ON medication_refill_requests(status, priority);
