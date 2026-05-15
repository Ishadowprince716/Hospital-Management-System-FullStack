CREATE TABLE IF NOT EXISTS housekeeping_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    room_number VARCHAR(40) NOT NULL,
    request_type VARCHAR(60) NOT NULL DEFAULT 'CLEANING',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    description VARCHAR(1200),
    assigned_staff VARCHAR(140),
    completion_note VARCHAR(1200),
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_housekeeping_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);

CREATE INDEX idx_housekeeping_patient_updated ON housekeeping_requests(patient_id, updated_at);
CREATE INDEX idx_housekeeping_status_priority ON housekeeping_requests(status, priority);
CREATE INDEX idx_housekeeping_room ON housekeeping_requests(room_number);
