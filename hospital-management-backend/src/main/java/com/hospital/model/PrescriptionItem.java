package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "medication_name", length = 255, nullable = false)
    private String medicationName;

    @Column(name = "dosage", length = 100)
    private String dosage; // e.g., "500mg", "10ml"

    @Column(name = "frequency", length = 100)
    private String frequency; // e.g., "Twice daily", "Every 8 hours"

    @Column(name = "duration", length = 100)
    private String duration; // e.g., "7 days", "2 weeks"

    @Column(name = "route", length = 50)
    private String route; // ORAL, INJECTION, TOPICAL, etc.

    @Column(name = "instructions", length = 500)
    private String instructions; // e.g., "Take after meals"

    @Column(name = "quantity")
    private Integer quantity; // Number of tablets/units

    // Constructors
    public PrescriptionItem() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    @JsonProperty("medicineName")
    public String getMedicineName() {
        return medicationName;
    }

    @JsonProperty("medicineName")
    public void setMedicineName(String medicineName) {
        this.medicationName = medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
