package com.hospital.service;

import com.hospital.dto.SystemSettingsDTO;
import com.hospital.model.SystemSetting;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.BillRepository;
import com.hospital.repository.mysql.SystemSettingRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemSettingsService {

    private static final String MAINTENANCE_MODE = "maintenanceMode";
    private static final String ALLOW_REGISTRATION = "allowRegistration";
    private static final String TELEHEALTH_ENABLED = "telehealthEnabled";
    private static final String EMAIL_NOTIFICATIONS = "emailNotificationsEnabled";
    private static final String SMS_NOTIFICATIONS = "smsNotificationsEnabled";
    private static final String MAX_APPOINTMENTS = "maxAppointmentsPerDoctorPerDay";
    private static final String REMINDER_HOURS = "appointmentReminderHours";
    private static final String BILLING_GRACE_DAYS = "billingGraceDays";
    private static final String SUPPORT_EMAIL = "supportEmail";
    private static final String EMERGENCY_BANNER = "emergencyBannerMessage";

    private final SystemSettingRepository settingsRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final String datasourceUrl;
    private final String activeProfile;

    public SystemSettingsService(SystemSettingRepository settingsRepository,
                                 UserRepository userRepository,
                                 AppointmentRepository appointmentRepository,
                                 BillRepository billRepository,
                                 @Value("${spring.datasource.url:}") String datasourceUrl,
                                 @Value("${spring.profiles.active:default}") String activeProfile) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
        this.datasourceUrl = datasourceUrl;
        this.activeProfile = activeProfile;
    }

    @Transactional(readOnly = true)
    public SystemSettingsDTO getSettings() {
        requireAdmin();
        Map<String, SystemSetting> settings = loadSettingsByKey();
        SystemSettingsDTO dto = toDto(settings);
        dto.setHealth(getHealthSnapshot());
        return dto;
    }

    @Transactional
    public SystemSettingsDTO updateSettings(SystemSettingsDTO request) {
        requireAdmin();
        validate(request);
        String updatedBy = resolveCurrentUsername();

        upsert(MAINTENANCE_MODE, boolValue(request.getMaintenanceMode(), false), updatedBy);
        upsert(ALLOW_REGISTRATION, boolValue(request.getAllowRegistration(), true), updatedBy);
        upsert(TELEHEALTH_ENABLED, boolValue(request.getTelehealthEnabled(), true), updatedBy);
        upsert(EMAIL_NOTIFICATIONS, boolValue(request.getEmailNotificationsEnabled(), true), updatedBy);
        upsert(SMS_NOTIFICATIONS, boolValue(request.getSmsNotificationsEnabled(), false), updatedBy);
        upsert(MAX_APPOINTMENTS, String.valueOf(intValue(request.getMaxAppointmentsPerDoctorPerDay(), 20)), updatedBy);
        upsert(REMINDER_HOURS, String.valueOf(intValue(request.getAppointmentReminderHours(), 24)), updatedBy);
        upsert(BILLING_GRACE_DAYS, String.valueOf(intValue(request.getBillingGraceDays(), 7)), updatedBy);
        upsert(SUPPORT_EMAIL, cleanText(request.getSupportEmail(), "support@medicare-hms.local", 150), updatedBy);
        upsert(EMERGENCY_BANNER, cleanText(request.getEmergencyBannerMessage(), "", 500), updatedBy);

        return getSettings();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getHealthSnapshot() {
        requireAdmin();
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "OPERATIONAL");
        health.put("activeProfile", activeProfile);
        health.put("database", resolveDatabaseProvider());
        health.put("auth", "JWT active");
        health.put("serverTime", LocalDateTime.now());
        health.put("totalUsers", safeCount(() -> userRepository.count()));
        health.put("totalAppointments", safeCount(() -> appointmentRepository.count()));
        health.put("totalBills", safeCount(() -> billRepository.count()));
        return health;
    }

    private Map<String, SystemSetting> loadSettingsByKey() {
        Map<String, SystemSetting> byKey = new HashMap<>();
        List<SystemSetting> rows = settingsRepository.findAll();
        for (SystemSetting row : rows) {
            byKey.put(row.getSettingKey(), row);
        }
        return byKey;
    }

    private SystemSettingsDTO toDto(Map<String, SystemSetting> settings) {
        SystemSettingsDTO dto = new SystemSettingsDTO();
        dto.setMaintenanceMode(readBool(settings, MAINTENANCE_MODE, false));
        dto.setAllowRegistration(readBool(settings, ALLOW_REGISTRATION, true));
        dto.setTelehealthEnabled(readBool(settings, TELEHEALTH_ENABLED, true));
        dto.setEmailNotificationsEnabled(readBool(settings, EMAIL_NOTIFICATIONS, true));
        dto.setSmsNotificationsEnabled(readBool(settings, SMS_NOTIFICATIONS, false));
        dto.setMaxAppointmentsPerDoctorPerDay(readInt(settings, MAX_APPOINTMENTS, 20));
        dto.setAppointmentReminderHours(readInt(settings, REMINDER_HOURS, 24));
        dto.setBillingGraceDays(readInt(settings, BILLING_GRACE_DAYS, 7));
        dto.setSupportEmail(readString(settings, SUPPORT_EMAIL, "support@medicare-hms.local"));
        dto.setEmergencyBannerMessage(readString(settings, EMERGENCY_BANNER, ""));

        settings.values().stream()
                .filter(setting -> setting.getUpdatedAt() != null)
                .max((a, b) -> a.getUpdatedAt().compareTo(b.getUpdatedAt()))
                .ifPresent(latest -> {
                    dto.setLastUpdatedAt(latest.getUpdatedAt());
                    dto.setLastUpdatedBy(latest.getUpdatedBy());
                });
        return dto;
    }

    private void upsert(String key, String value, String updatedBy) {
        SystemSetting setting = settingsRepository.findBySettingKey(key).orElseGet(SystemSetting::new);
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setUpdatedBy(updatedBy);
        settingsRepository.save(setting);
    }

    private void validate(SystemSettingsDTO request) {
        int maxAppointments = intValue(request.getMaxAppointmentsPerDoctorPerDay(), 20);
        int reminderHours = intValue(request.getAppointmentReminderHours(), 24);
        int graceDays = intValue(request.getBillingGraceDays(), 7);

        if (maxAppointments < 1 || maxAppointments > 200) {
            throw new IllegalArgumentException("Max appointments per doctor per day must be between 1 and 200.");
        }
        if (reminderHours < 1 || reminderHours > 168) {
            throw new IllegalArgumentException("Appointment reminder hours must be between 1 and 168.");
        }
        if (graceDays < 0 || graceDays > 90) {
            throw new IllegalArgumentException("Billing grace days must be between 0 and 90.");
        }
        if (request.getSupportEmail() != null && request.getSupportEmail().length() > 150) {
            throw new IllegalArgumentException("Support email must be 150 characters or fewer.");
        }
        if (request.getEmergencyBannerMessage() != null && request.getEmergencyBannerMessage().length() > 500) {
            throw new IllegalArgumentException("Emergency banner must be 500 characters or fewer.");
        }
    }

    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Admin role is required.");
        }
    }

    private String resolveCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? String.valueOf(auth.getPrincipal()) : "system";
    }

    private Boolean readBool(Map<String, SystemSetting> settings, String key, boolean fallback) {
        SystemSetting setting = settings.get(key);
        return setting == null ? fallback : Boolean.parseBoolean(setting.getSettingValue());
    }

    private Integer readInt(Map<String, SystemSetting> settings, String key, int fallback) {
        SystemSetting setting = settings.get(key);
        if (setting == null) return fallback;
        try {
            return Integer.parseInt(setting.getSettingValue());
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private String readString(Map<String, SystemSetting> settings, String key, String fallback) {
        SystemSetting setting = settings.get(key);
        return setting == null ? fallback : setting.getSettingValue();
    }

    private String boolValue(Boolean value, boolean fallback) {
        return String.valueOf(value != null ? value : fallback);
    }

    private int intValue(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private String cleanText(String value, String fallback, int maxLength) {
        String cleaned = value == null ? fallback : value.trim();
        if (cleaned.length() > maxLength) {
            return cleaned.substring(0, maxLength);
        }
        return cleaned;
    }

    private long safeCount(CountSupplier supplier) {
        try {
            return supplier.count();
        } catch (RuntimeException ex) {
            return 0L;
        }
    }

    private String resolveDatabaseProvider() {
        String lower = datasourceUrl == null ? "" : datasourceUrl.toLowerCase();
        if (lower.contains("mysql")) return "MySQL";
        if (lower.contains("postgresql")) return "PostgreSQL";
        if (lower.contains("h2")) return "H2";
        if (lower.isBlank()) return "Configured by environment";
        return "JDBC";
    }

    @FunctionalInterface
    private interface CountSupplier {
        long count();
    }
}
