package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DischargePlanDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String status;
    private LocalDate plannedDischargeDate;
    private String diagnosis;
    private String medicationInstructions;
    private String careInstructions;
    private String followUpPlan;
    private String redFlags;
    private boolean transportRequired;
    private boolean billingCleared;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getPlannedDischargeDate() { return plannedDischargeDate; }
    public void setPlannedDischargeDate(LocalDate plannedDischargeDate) { this.plannedDischargeDate = plannedDischargeDate; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getMedicationInstructions() { return medicationInstructions; }
    public void setMedicationInstructions(String medicationInstructions) { this.medicationInstructions = medicationInstructions; }
    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }
    public String getFollowUpPlan() { return followUpPlan; }
    public void setFollowUpPlan(String followUpPlan) { this.followUpPlan = followUpPlan; }
    public String getRedFlags() { return redFlags; }
    public void setRedFlags(String redFlags) { this.redFlags = redFlags; }
    public boolean isTransportRequired() { return transportRequired; }
    public void setTransportRequired(boolean transportRequired) { this.transportRequired = transportRequired; }
    public boolean isBillingCleared() { return billingCleared; }
    public void setBillingCleared(boolean billingCleared) { this.billingCleared = billingCleared; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
