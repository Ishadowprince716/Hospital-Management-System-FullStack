package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReferralRequestDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long referringDoctorId;
    private String referringDoctorName;
    private String specialty;
    private String priority;
    private String status;
    private String reason;
    private String notes;
    private LocalDate preferredDate;
    private String coordinatorNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Long getReferringDoctorId() { return referringDoctorId; }
    public void setReferringDoctorId(Long referringDoctorId) { this.referringDoctorId = referringDoctorId; }
    public String getReferringDoctorName() { return referringDoctorName; }
    public void setReferringDoctorName(String referringDoctorName) { this.referringDoctorName = referringDoctorName; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }
    public String getCoordinatorNote() { return coordinatorNote; }
    public void setCoordinatorNote(String coordinatorNote) { this.coordinatorNote = coordinatorNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
