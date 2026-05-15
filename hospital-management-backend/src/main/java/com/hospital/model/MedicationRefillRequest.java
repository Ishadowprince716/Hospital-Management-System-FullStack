package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_refill_requests")
public class MedicationRefillRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Patient patient;

    @Column(name = "medication_name", nullable = false, length = 140)
    private String medicationName;

    @Column(length = 100)
    private String dosage;

    @Column(name = "last_prescription_ref", length = 120)
    private String lastPrescriptionRef;

    @Column(length = 80)
    private String quantity;

    @Column(name = "preferred_pickup_date")
    private LocalDate preferredPickupDate;

    @Column(name = "delivery_option", nullable = false, length = 30)
    private String deliveryOption = "PICKUP";

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(nullable = false, length = 30)
    private String priority = "NORMAL";

    @Column(length = 1200)
    private String notes;

    @Column(name = "pharmacist_note", length = 1200)
    private String pharmacistNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
