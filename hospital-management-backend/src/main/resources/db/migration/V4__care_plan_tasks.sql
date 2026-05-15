CREATE TABLE IF NOT EXISTS care_plan_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    category VARCHAR(40) NOT NULL,
    task_time VARCHAR(40) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_care_plan_tasks_patient FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_care_plan_tasks_patient_done ON care_plan_tasks(patient_id, done);
