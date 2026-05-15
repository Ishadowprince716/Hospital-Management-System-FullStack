CREATE TABLE IF NOT EXISTS discharge_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    planned_discharge_date DATE,
    diagnosis VARCHAR(1200),
    medication_instructions VARCHAR(1600),
    care_instructions VARCHAR(1600),
    follow_up_plan VARCHAR(1200),
    red_flags VARCHAR(1200),
    transport_required BOOLEAN NOT NULL DEFAULT FALSE,
    billing_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_discharge_plans_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_discharge_plans_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_discharge_plans_patient_updated ON discharge_plans(patient_id, updated_at);
CREATE INDEX idx_discharge_plans_doctor_updated ON discharge_plans(doctor_id, updated_at);
CREATE INDEX idx_discharge_plans_status_date ON discharge_plans(status, planned_discharge_date);
