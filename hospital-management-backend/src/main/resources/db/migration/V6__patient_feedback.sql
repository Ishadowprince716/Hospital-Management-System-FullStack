CREATE TABLE IF NOT EXISTS patient_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    rating INT NOT NULL,
    wait_time_rating INT,
    staff_rating INT,
    doctor_rating INT,
    category VARCHAR(80),
    comment VARCHAR(1200),
    follow_up_requested BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_feedback_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_feedback_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

CREATE INDEX idx_patient_feedback_patient_created ON patient_feedback(patient_id, created_at);
CREATE INDEX idx_patient_feedback_rating_followup ON patient_feedback(rating, follow_up_requested);
