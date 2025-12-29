-- Sample Data for Hospital Management System
-- Run this after the application has created the tables

USE hospital_management;

-- Clear existing sample data (keep admin and first entries)
DELETE FROM appointments WHERE id > 0;
DELETE FROM medical_records WHERE id > 0;
DELETE FROM bills WHERE id > 0;
DELETE FROM doctors WHERE id > 2;
DELETE FROM patients WHERE id > 3;
DELETE FROM users WHERE id > 3;

-- Sample Doctors (password for all: "doctor123")
-- Password hash: $2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2
INSERT INTO users (username, password, email, phone_number, role, full_name, is_active, created_at, updated_at) VALUES
('dr.priya', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'priya.sharma@hospital.com', '9876543211', 'DOCTOR', 'Dr. Priya Sharma', true, NOW(), NOW()),
('dr.amit', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'amit.kumar@hospital.com', '9876543212', 'DOCTOR', 'Dr. Amit Kumar', true, NOW(), NOW()),
('dr.sneha', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'sneha.reddy@hospital.com', '9876543213', 'DOCTOR', 'Dr. Sneha Reddy', true, NOW(), NOW()),
('dr.rajesh', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'rajesh.verma@hospital.com', '9876543214', 'DOCTOR', 'Dr. Rajesh Verma', true, NOW(), NOW()),
('dr.ananya', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'ananya.gupta@hospital.com', '9876543215', 'DOCTOR', 'Dr. Ananya Gupta', true, NOW(), NOW()),
('dr.vikram', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'vikram.singh@hospital.com', '9876543216', 'DOCTOR', 'Dr. Vikram Singh', true, NOW(), NOW()),
('dr.meera', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'meera.patel@hospital.com', '9876543217', 'DOCTOR', 'Dr. Meera Patel', true, NOW(), NOW());

INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, department, license_number, available_days, available_time_start, available_time_end, rating, total_patients) VALUES
-- Dr. Priya Sharma - Cardiologist
((SELECT id FROM users WHERE username = 'dr.priya'), 'Cardiology', 'MBBS, MD (Cardiology), DM', 12, 1200.00, 'Heart & Vascular', 'DOC789012', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '09:00', '17:00', 4.8, 450),
-- Dr. Amit Kumar - Dermatologist
((SELECT id FROM users WHERE username = 'dr.amit'), 'Dermatology', 'MBBS, MD (Dermatology)', 8, 800.00, 'Skin & Cosmetic', 'DOC345678', '["Monday","Wednesday","Friday","Saturday"]', '10:00', '18:00', 4.6, 320),
-- Dr. Sneha Reddy - Pediatrician
((SELECT id FROM users WHERE username = 'dr.sneha'), 'Pediatrics', 'MBBS, MD (Pediatrics)', 10, 900.00, 'Child Health', 'DOC901234', '["Monday","Tuesday","Thursday","Friday","Saturday"]', '08:00', '16:00', 4.9, 580),
-- Dr. Rajesh Verma - Orthopedic
((SELECT id FROM users WHERE username = 'dr.rajesh'), 'Orthopedics', 'MBBS, MS (Orthopedics)', 15, 1500.00, 'Bone & Joint', 'DOC567890', '["Tuesday","Wednesday","Thursday","Friday"]', '11:00', '19:00', 4.7, 610),
-- Dr. Ananya Gupta - Gynecologist
((SELECT id FROM users WHERE username = 'dr.ananya'), 'Gynecology', 'MBBS, MD (OB-GYN)', 9, 1000.00, 'Women\'s Health', 'DOC234567', '["Monday","Tuesday","Wednesday","Thursday","Saturday"]', '09:00', '17:00', 4.8, 520),
-- Dr. Vikram Singh - Neurologist
((SELECT id FROM users WHERE username = 'dr.vikram'), 'Neurology', 'MBBS, MD, DM (Neurology)', 14, 1800.00, 'Brain & Nervous System', 'DOC678901', '["Monday","Wednesday","Thursday","Friday"]', '10:00', '16:00', 4.9, 380),
-- Dr. Meera Patel - ENT Specialist
((SELECT id FROM users WHERE username = 'dr.meera'), 'ENT (Otolaryngology)', 'MBBS, MS (ENT)', 7, 700.00, 'Ear, Nose & Throat', 'DOC890123', '["Tuesday","Wednesday","Friday","Saturday"]', '09:00', '17:00', 4.5, 290);

-- Sample Patients (password for all: "patient123")
-- Password hash: $2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2
INSERT INTO users (username, password, email, phone_number, role, full_name, is_active, created_at, updated_at) VALUES
('patient2', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'arjun.mehta@email.com', '9123456781', 'PATIENT', 'Arjun Mehta', true, NOW(), NOW()),
('patient3', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'kavya.nair@email.com', '9123456782', 'PATIENT', 'Kavya Nair', true, NOW(), NOW()),
('patient4', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'rohan.desai@email.com', '9123456783', 'PATIENT', 'Rohan Desai', true, NOW(), NOW()),
('patient5', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'ishita.joshi@email.com', '9123456784', 'PATIENT', 'Ishita Joshi', true, NOW(), NOW()),
('patient6', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'aditya.rao@email.com', '9123456785', 'PATIENT', 'Aditya Rao', true, NOW(), NOW()),
('patient7', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'pooja.iyer@email.com', '9123456786', 'PATIENT', 'Pooja Iyer', true, NOW(), NOW()),
('patient8', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mirj.eSHdJDSJ5vp2', 'nikhil.shah@email.com', '9123456787', 'PATIENT', 'Nikhil Shah', true, NOW(), NOW()),
('patient9', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'riya.chopra@email.com', '9123456788', 'PATIENT', 'Riya Chopra', true, NOW(), NOW()),
('patient10', '$2a$10$quJUxu7Si1nOwb1Rq6ax5O.qywBVGT8VHHPn5mrj.eSHdJDSJ5vp2', 'varun.malhotra@email.com', '9123456789', 'PATIENT', 'Varun Malhotra', true, NOW(), NOW());

INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, emergency_contact_phone, blood_group, medical_history, allergies, current_medications) VALUES
-- Arjun Mehta
((SELECT id FROM users WHERE username = 'patient2'), '1990-05-15', 'Male', '123 MG Road, Bangalore, Karnataka 560001', 'Priya Mehta (Wife)', '9123456801', 'O+', 'Hypertension (2018)', 'Penicillin', 'Amlodipine 5mg'),
-- Kavya Nair
((SELECT id FROM users WHERE username = 'patient3'), '1985-08-22', 'Female', '456 Marine Drive, Mumbai, Maharashtra 400002', 'Suresh Nair (Husband)', '9123456802', 'A+', 'Asthma', 'Dust, Pollen', 'Salbutamol Inhaler'),
-- Rohan Desai
((SELECT id FROM users WHERE username = 'patient4'), '1995-03-10', 'Male', '789 Park Street, Kolkata, West Bengal 700016', 'Neha Desai (Mother)', '9123456803', 'B+', 'None', 'None', 'None'),
-- Ishita Joshi
((SELECT id FROM users WHERE username = 'patient5'), '1988-11-30', 'Female', '321 Anna Salai, Chennai, Tamil Nadu 600002', 'Rahul Joshi (Brother)', '9123456804', 'AB+', 'Migraine', 'Sulfa drugs', 'Sumatriptan as needed'),
-- Aditya Rao
((SELECT id FROM users WHERE username = 'patient6'), '1992-07-18', 'Male', '654 Banjara Hills, Hyderabad, Telangana 500034', 'Lakshmi Rao (Mother)', '9123456805', 'O-', 'Diabetes Type 2 (2020)', 'None', 'Metformin 500mg'),
-- Pooja Iyer
((SELECT id FROM users WHERE username = 'patient7'), '1987-12-05', 'Female', '987 Whitefield, Bangalore, Karnataka 560066', 'Karthik Iyer (Husband)', '9123456806', 'A-', 'Thyroid (Hypothyroid)', 'Iodine', 'Levothyroxine 50mcg'),
-- Nikhil Shah
((SELECT id FROM users WHERE username = 'patient8'), '1993-09-25', 'Male', '147 Kalyani Nagar, Pune, Maharashtra 411006', 'Anjali Shah (Sister)', '9123456807', 'B-', 'None', 'Latex', 'None'),
-- Riya Chopra
((SELECT id FROM users WHERE username = 'patient9'), '1991-04-12', 'Female', '258 Golf Course Road, Gurgaon, Haryana 122002', 'Vikram Chopra (Father)', '9123456808', 'AB-', 'PCOS', 'None', 'Birth control pills'),
-- Varun Malhotra
((SELECT id FROM users WHERE username = 'patient10'), '1989-06-08', 'Male', '369 Vasant Vihar, Delhi, NCR 110057', 'Sanjana Malhotra (Wife)', '9123456809', 'O+', 'High Cholesterol', 'None', 'Atorvastatin 10mg');

-- Sample Appointments (mix of scheduled, completed, and cancelled)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, reason, created_at, updated_at) VALUES
-- Past completed appointments
((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.priya')), 
 '2025-12-20', '10:00', 'CONSULTATION', 'COMPLETED', 'Chest pain and palpitations', NOW(), NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient3')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.sneha')), 
 '2025-12-22', '14:30', 'FOLLOW_UP', 'COMPLETED', 'Regular pediatric checkup for daughter', NOW(), NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient4')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.amit')), 
 '2025-12-18', '11:00', 'CONSULTATION', 'COMPLETED', 'Skin rash and itching', NOW(), NOW()),

-- Upcoming scheduled appointments
((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient5')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.vikram')), 
 '2025-12-28', '15:00', 'CONSULTATION', 'SCHEDULED', 'Frequent headaches and dizziness', NOW(), NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient6')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.priya')), 
 '2025-12-29', '10:30', 'FOLLOW_UP', 'SCHEDULED', 'Diabetes management follow-up', NOW(), NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient7')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.ananya')), 
 '2025-12-30', '09:00', 'CONSULTATION', 'SCHEDULED', 'Thyroid check and consultation', NOW(), NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient8')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.rajesh')), 
 '2025-12-31', '16:00', 'CONSULTATION', 'SCHEDULED', 'Knee pain after sports injury', NOW(), NOW()),

-- One cancelled appointment
((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient9')), 
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.meera')), 
 '2025-12-25', '11:00', 'CONSULTATION', 'CANCELLED', 'Ear infection', NOW(), NOW());

-- Sample Medical Records for completed appointments
INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes, record_date, created_at) VALUES
((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')),
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.priya')),
 'Mild Hypertension',
 'Amlodipine 5mg - Once daily\nAspirin 75mg - Once daily',
 'Patient advised to reduce salt intake and exercise regularly. Follow-up in 1 month.',
 '2025-12-20',
 NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient3')),
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.sneha')),
 'Healthy - Routine Checkup',
 'Multivitamin syrup - 5ml daily',
 'Child is healthy and growing well. Next vaccination scheduled.',
 '2025-12-22',
 NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient4')),
 (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE username = 'dr.amit')),
 'Allergic Dermatitis',
 'Cetirizine 10mg - Once daily for 7 days\nHydrocortisone cream - Apply twice daily',
 'Avoid allergen exposure. Use fragrance-free products.',
 '2025-12-18',
 NOW());

-- Sample Bills
INSERT INTO bills (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_method, bill_date, due_date, created_at) VALUES
((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')),
 (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient2')) LIMIT 1),
 1500.00, 1500.00, 'PAID', 'CARD', '2025-12-20', '2025-12-27', NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient3')),
 (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient3')) LIMIT 1),
 1100.00, 1100.00, 'PAID', 'UPI', '2025-12-22', '2025-12-29', NOW()),

((SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient4')),
 (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE username = 'patient4')) LIMIT 1),
 1200.00, 600.00, 'PARTIAL', 'CASH', '2025-12-18', '2025-12-25', NOW());

-- Success message
SELECT 'Sample data inserted successfully!' AS Result;
SELECT COUNT(*) AS 'Total Doctors' FROM doctors;
SELECT COUNT(*) AS 'Total Patients' FROM patients;
SELECT COUNT(*) AS 'Total Appointments' FROM appointments;
SELECT COUNT(*) AS 'Total Medical Records' FROM medical_records;
SELECT COUNT(*) AS 'Total Bills' FROM bills;
