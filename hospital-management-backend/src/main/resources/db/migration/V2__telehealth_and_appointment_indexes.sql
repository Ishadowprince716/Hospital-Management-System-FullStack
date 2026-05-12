-- Adds high-value indexes used by appointment lookup and telehealth room routing.
-- The dynamic SQL keeps this migration idempotent on existing databases.

-- Appointments: doctor/date/time lookup
SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND index_name = 'idx_appointments_doctor_date_time'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE INDEX idx_appointments_doctor_date_time ON appointments (doctor_id, appointment_date, appointment_time)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Appointments: patient timeline lookup
SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND index_name = 'idx_appointments_patient_date'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Appointments: status/dashboard filters
SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND index_name = 'idx_appointments_status'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE INDEX idx_appointments_status ON appointments (status)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Telehealth: unique room name and fast join by appointment
SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'telehealth_sessions'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'telehealth_sessions'
      AND index_name = 'ux_telehealth_room_name'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE UNIQUE INDEX ux_telehealth_room_name ON telehealth_sessions (room_name)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'telehealth_sessions'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'telehealth_sessions'
      AND index_name = 'idx_telehealth_appointment'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE INDEX idx_telehealth_appointment ON telehealth_sessions (appointment_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Users: role-based dashboards and active-user listing
SET @has_table = (
    SELECT COUNT(1)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
);
SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND index_name = 'idx_users_role_active'
);
SET @sql = IF(@has_table = 1 AND @idx_count = 0,
    'CREATE INDEX idx_users_role_active ON users (role, is_active)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
