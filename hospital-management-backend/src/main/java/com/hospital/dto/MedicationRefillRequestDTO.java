package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicationRefillRequestDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String medicationName;
    private String dosage;
    private String lastPrescriptionRef;
    private String quantity;
    private LocalDate preferredPickupDate;
    private String deliveryOption;
    private String status;
    private String priority;
    private String notes;
    private String pharmacistNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getLastPrescriptionRef() { return lastPrescriptionRef; }
    public void setLastPrescriptionRef(String lastPrescriptionRef) { this.lastPrescriptionRef = lastPrescriptionRef; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public LocalDate getPreferredPickupDate() { return preferredPickupDate; }
    public void setPreferredPickupDate(LocalDate preferredPickupDate) { this.preferredPickupDate = preferredPickupDate; }
    public String getDeliveryOption() { return deliveryOption; }
    public void setDeliveryOption(String deliveryOption) { this.deliveryOption = deliveryOption; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPharmacistNote() { return pharmacistNote; }
    public void setPharmacistNote(String pharmacistNote) { this.pharmacistNote = pharmacistNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
