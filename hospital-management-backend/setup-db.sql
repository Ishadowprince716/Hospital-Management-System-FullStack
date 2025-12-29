-- Create MySQL user and database for Hospital Management System
CREATE USER IF NOT EXISTS 'hospital_user'@'localhost' IDENTIFIED BY 'hospital123';
CREATE DATABASE IF NOT EXISTS hospital_db;
GRANT ALL PRIVILEGES ON hospital_db.* TO 'hospital_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'User and database created successfully!' AS status;
