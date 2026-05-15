package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_feedback")
public class PatientFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Appointment appointment;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "wait_time_rating")
    private Integer waitTimeRating;

    @Column(name = "staff_rating")
    private Integer staffRating;

    @Column(name = "doctor_rating")
    private Integer doctorRating;

    @Column(length = 80)
    private String category;

    @Column(length = 1200)
    private String comment;

    @Column(name = "follow_up_requested", nullable = false)
    private boolean followUpRequested;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Integer getWaitTimeRating() {
        return waitTimeRating;
    }

    public void setWaitTimeRating(Integer waitTimeRating) {
        this.waitTimeRating = waitTimeRating;
    }

    public Integer getStaffRating() {
        return staffRating;
    }

    public void setStaffRating(Integer staffRating) {
        this.staffRating = staffRating;
    }

    public Integer getDoctorRating() {
        return doctorRating;
    }

    public void setDoctorRating(Integer doctorRating) {
        this.doctorRating = doctorRating;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public boolean isFollowUpRequested() {
        return followUpRequested;
    }

    public void setFollowUpRequested(boolean followUpRequested) {
        this.followUpRequested = followUpRequested;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
