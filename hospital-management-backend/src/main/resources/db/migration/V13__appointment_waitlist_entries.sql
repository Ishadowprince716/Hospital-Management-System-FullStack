CREATE TABLE IF NOT EXISTS appointment_waitlist_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    specialty VARCHAR(120),
    current_appointment_date DATE,
    desired_start_date DATE NOT NULL,
    desired_end_date DATE,
    time_preference VARCHAR(80),
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    reason VARCHAR(1200),
    coordinator_note VARCHAR(1200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_waitlist_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id),
    CONSTRAINT fk_waitlist_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(user_id)
);

CREATE INDEX idx_waitlist_patient_updated ON appointment_waitlist_entries(patient_id, updated_at);
CREATE INDEX idx_waitlist_status_priority ON appointment_waitlist_entries(status, priority);
CREATE INDEX idx_waitlist_doctor ON appointment_waitlist_entries(doctor_id);
