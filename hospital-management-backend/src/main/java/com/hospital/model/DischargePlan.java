package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "discharge_plans")
public class DischargePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Doctor doctor;

    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(name = "planned_discharge_date")
    private LocalDate plannedDischargeDate;

    @Column(length = 1200)
    private String diagnosis;

    @Column(name = "medication_instructions", length = 1600)
    private String medicationInstructions;

    @Column(name = "care_instructions", length = 1600)
    private String careInstructions;

    @Column(name = "follow_up_plan", length = 1200)
    private String followUpPlan;

    @Column(name = "red_flags", length = 1200)
    private String redFlags;

    @Column(name = "transport_required")
    private boolean transportRequired;

    @Column(name = "billing_cleared")
    private boolean billingCleared;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
