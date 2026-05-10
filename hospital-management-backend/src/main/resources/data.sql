-- Sample Data for H2 In-Memory Database

-- Sample Doctors (password for all: "doctor123")
INSERT INTO users (username, password, email, phone_number, role, full_name, is_active, created_at, updated_at) VALUES
('dr.priya', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'priya.sharma@hospital.com', '9876543211', 'DOCTOR', 'Dr. Priya Sharma', true, NOW(), NOW()),
('dr.amit', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'amit.kumar@hospital.com', '9876543212', 'DOCTOR', 'Dr. Amit Kumar', true, NOW(), NOW()),
('dr.sneha', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'sneha.reddy@hospital.com', '9876543213', 'DOCTOR', 'Dr. Sneha Reddy', true, NOW(), NOW());

INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, department, license_number, available_days, available_time_start, available_time_end, rating, total_patients) VALUES
((SELECT id FROM users WHERE username = 'dr.priya'), 'Cardiology', 'MBBS, MD (Cardiology)', 12, 1200.00, 'Heart & Vascular', 'DOC789012', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '09:00', '17:00', 4.8, 450),
((SELECT id FROM users WHERE username = 'dr.amit'), 'Dermatology', 'MBBS, MD (Dermatology)', 8, 800.00, 'Skin & Cosmetic', 'DOC345678', '["Monday","Wednesday","Friday","Saturday"]', '10:00', '18:00', 4.6, 320),
((SELECT id FROM users WHERE username = 'dr.sneha'), 'Pediatrics', 'MBBS, MD (Pediatrics)', 10, 900.00, 'Child Health', 'DOC901234', '["Monday","Tuesday","Thursday","Friday","Saturday"]', '08:00', '16:00', 4.9, 580);

-- Sample Patients (password for all: "patient123")
INSERT INTO users (username, password, email, phone_number, role, full_name, is_active, created_at, updated_at) VALUES
('patient2', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'arjun.mehta@email.com', '9123456781', 'PATIENT', 'Arjun Mehta', true, NOW(), NOW()),
('patient3', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'kavya.nair@email.com', '9123456782', 'PATIENT', 'Kavya Nair', true, NOW(), NOW()),
('patient4', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'rohan.desai@email.com', '9123456783', 'PATIENT', 'Rohan Desai', true, NOW(), NOW());

INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, emergency_contact_name, blood_group, insurance_provider, allergies, current_medications) VALUES
((SELECT id FROM users WHERE username = 'patient2'), '1990-05-15', 'Male', '123 MG Road, Bangalore', '9123456801', 'Priya Mehta (Wife)', 'O+', 'HDFC Ergo', 'Penicillin', 'Amlodipine'),
((SELECT id FROM users WHERE username = 'patient3'), '1985-08-22', 'Female', '456 Marine Drive, Mumbai', '9123456802', 'Suresh Nair (Husband)', 'A+', 'Star Health', 'Dust', 'Inhaler'),
((SELECT id FROM users WHERE username = 'patient4'), '1995-03-10', 'Male', '789 Park Street, Kolkata', '9123456803', 'Neha Desai (Mother)', 'B+', 'ICICI Lombard', 'None', 'None');

-- Sample Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, reason, created_at, updated_at) VALUES
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')),
 (SELECT user_id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.priya')),
 '2026-05-15', '10:00', 'CONSULTATION', 'COMPLETED', 'Chest pain', NOW(), NOW()),

((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient3')),
 (SELECT user_id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.sneha')),
 '2026-05-20', '14:30', 'FOLLOW_UP', 'SCHEDULED', 'Checkup', NOW(), NOW()),

((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient4')),
 (SELECT user_id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.amit')),
 '2026-05-25', '11:00', 'CONSULTATION', 'SCHEDULED', 'Skin rash', NOW(), NOW());

-- Sample Bills
INSERT INTO bills (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_method, bill_date, due_date, created_at) VALUES
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')),
 (SELECT id FROM appointments WHERE patient_id = (SELECT user_id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')) LIMIT 1),
 1500.00, 1500.00, 'PAID', 'CARD', '2026-05-15', '2026-05-22', NOW());
