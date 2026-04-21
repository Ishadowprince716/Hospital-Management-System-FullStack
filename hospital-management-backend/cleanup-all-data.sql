-- Cleanup Script: Remove All Patient and Doctor Data
-- This script will delete all patients, doctors, and related data
-- while preserving the admin account

USE hospital_management;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all appointments (this will cascade to related data)
DELETE FROM appointments WHERE id > 0;

-- Delete all medical records
DELETE FROM medical_records WHERE id > 0;

-- Delete all bills
DELETE FROM bills WHERE id > 0;

-- Delete all notifications
DELETE FROM notifications WHERE id > 0;

-- Delete all doctors
DELETE FROM doctors WHERE id > 0;

-- Delete all patients
DELETE FROM patients WHERE id > 0;

-- Delete all users except admin (keep admin with id = 1)
-- This assumes admin account is the first user created
DELETE FROM users WHERE id > 1 AND role IN ('DOCTOR', 'PATIENT');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE patients AUTO_INCREMENT = 1;
ALTER TABLE doctors AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE medical_records AUTO_INCREMENT = 1;
ALTER TABLE bills AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;

-- Verify cleanup
SELECT 'Data cleanup completed!' AS Result;
SELECT COUNT(*) AS 'Remaining Users (Should be 1 - Admin only)' FROM users;
SELECT COUNT(*) AS 'Remaining Doctors (Should be 0)' FROM doctors;
SELECT COUNT(*) AS 'Remaining Patients (Should be 0)' FROM patients;
SELECT COUNT(*) AS 'Remaining Appointments (Should be 0)' FROM appointments;
SELECT COUNT(*) AS 'Remaining Medical Records (Should be 0)' FROM medical_records;
SELECT COUNT(*) AS 'Remaining Bills (Should be 0)' FROM bills;
