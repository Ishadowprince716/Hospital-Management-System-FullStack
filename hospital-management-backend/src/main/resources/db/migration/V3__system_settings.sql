CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(1000) NOT NULL,
    updated_by VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_system_settings_key UNIQUE (setting_key)
);

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'maintenanceMode', 'false', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'maintenanceMode');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'allowRegistration', 'true', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'allowRegistration');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'telehealthEnabled', 'true', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'telehealthEnabled');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'emailNotificationsEnabled', 'true', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'emailNotificationsEnabled');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'smsNotificationsEnabled', 'false', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'smsNotificationsEnabled');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'maxAppointmentsPerDoctorPerDay', '20', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'maxAppointmentsPerDoctorPerDay');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'appointmentReminderHours', '24', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'appointmentReminderHours');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'billingGraceDays', '7', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'billingGraceDays');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'supportEmail', 'support@medicare-hms.local', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'supportEmail');

INSERT INTO system_settings (setting_key, setting_value, updated_by)
SELECT 'emergencyBannerMessage', '', 'migration'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'emergencyBannerMessage');
