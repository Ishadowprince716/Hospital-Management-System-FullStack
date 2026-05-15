CREATE TABLE IF NOT EXISTS dietary_meal_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    meal_date DATE NOT NULL,
    meal_type VARCHAR(40) NOT NULL DEFAULT 'LUNCH',
    diet_type VARCHAR(80) NOT NULL DEFAULT 'REGULAR',
    room_number VARCHAR(40),
    allergy_notes VARCHAR(1000),
    preferences VARCHAR(1200),
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    nutrition_note VARCHAR(1200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dietary_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);

CREATE INDEX idx_dietary_patient_updated ON dietary_meal_requests(patient_id, updated_at);
CREATE INDEX idx_dietary_status_priority ON dietary_meal_requests(status, priority);
CREATE INDEX idx_dietary_meal_date ON dietary_meal_requests(meal_date);
