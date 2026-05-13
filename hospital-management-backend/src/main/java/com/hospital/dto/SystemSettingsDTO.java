package com.hospital.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class SystemSettingsDTO {
    private Boolean maintenanceMode;
    private Boolean allowRegistration;
    private Boolean telehealthEnabled;
    private Boolean emailNotificationsEnabled;
    private Boolean smsNotificationsEnabled;
    private Integer maxAppointmentsPerDoctorPerDay;
    private Integer appointmentReminderHours;
    private Integer billingGraceDays;
    private String supportEmail;
    private String emergencyBannerMessage;
    private String lastUpdatedBy;
    private LocalDateTime lastUpdatedAt;
    private Map<String, Object> health;

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public Boolean getAllowRegistration() {
        return allowRegistration;
    }

    public void setAllowRegistration(Boolean allowRegistration) {
        this.allowRegistration = allowRegistration;
    }

    public Boolean getTelehealthEnabled() {
        return telehealthEnabled;
    }

    public void setTelehealthEnabled(Boolean telehealthEnabled) {
        this.telehealthEnabled = telehealthEnabled;
    }

    public Boolean getEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) {
        this.emailNotificationsEnabled = emailNotificationsEnabled;
    }

    public Boolean getSmsNotificationsEnabled() {
        return smsNotificationsEnabled;
    }

    public void setSmsNotificationsEnabled(Boolean smsNotificationsEnabled) {
        this.smsNotificationsEnabled = smsNotificationsEnabled;
    }

    public Integer getMaxAppointmentsPerDoctorPerDay() {
        return maxAppointmentsPerDoctorPerDay;
    }

    public void setMaxAppointmentsPerDoctorPerDay(Integer maxAppointmentsPerDoctorPerDay) {
        this.maxAppointmentsPerDoctorPerDay = maxAppointmentsPerDoctorPerDay;
    }

    public Integer getAppointmentReminderHours() {
        return appointmentReminderHours;
    }

    public void setAppointmentReminderHours(Integer appointmentReminderHours) {
        this.appointmentReminderHours = appointmentReminderHours;
    }

    public Integer getBillingGraceDays() {
        return billingGraceDays;
    }

    public void setBillingGraceDays(Integer billingGraceDays) {
        this.billingGraceDays = billingGraceDays;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getEmergencyBannerMessage() {
        return emergencyBannerMessage;
    }

    public void setEmergencyBannerMessage(String emergencyBannerMessage) {
        this.emergencyBannerMessage = emergencyBannerMessage;
    }

    public String getLastUpdatedBy() {
        return lastUpdatedBy;
    }

    public void setLastUpdatedBy(String lastUpdatedBy) {
        this.lastUpdatedBy = lastUpdatedBy;
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public Map<String, Object> getHealth() {
        return health;
    }

    public void setHealth(Map<String, Object> health) {
        this.health = health;
    }
}
