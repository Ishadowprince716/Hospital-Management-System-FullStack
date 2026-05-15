CREATE TABLE IF NOT EXISTS visitor_pass_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    visitor_name VARCHAR(140) NOT NULL,
    visitor_phone VARCHAR(40) NOT NULL,
    relationship VARCHAR(80),
    visit_date DATE NOT NULL,
    time_window VARCHAR(80),
    purpose VARCHAR(800),
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    risk_level VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    pass_code VARCHAR(40),
    checked_in_at DATETIME,
    checked_out_at DATETIME,
    front_desk_note VARCHAR(1200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_visitor_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);

CREATE INDEX idx_visitor_patient_updated ON visitor_pass_requests(patient_id, updated_at);
CREATE INDEX idx_visitor_status_risk ON visitor_pass_requests(status, risk_level);
CREATE INDEX idx_visitor_visit_date ON visitor_pass_requests(visit_date);
