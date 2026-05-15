CREATE TABLE IF NOT EXISTS emergency_transport_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    pickup_location VARCHAR(500) NOT NULL,
    destination VARCHAR(300),
    contact_phone VARCHAR(40) NOT NULL,
    transport_type VARCHAR(40) NOT NULL DEFAULT 'AMBULANCE',
    severity VARCHAR(30) NOT NULL DEFAULT 'MODERATE',
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    symptoms VARCHAR(1200),
    vehicle_number VARCHAR(80),
    crew_name VARCHAR(140),
    eta_minutes INT,
    dispatcher_note VARCHAR(1200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transport_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);

CREATE INDEX idx_transport_patient_updated ON emergency_transport_requests(patient_id, updated_at);
CREATE INDEX idx_transport_status_severity ON emergency_transport_requests(status, severity);
