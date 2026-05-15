package com.hospital.dto;

import java.time.LocalDateTime;

public class PatientFeedbackDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private String doctorName;
    private Integer rating;
    private Integer waitTimeRating;
    private Integer staffRating;
    private Integer doctorRating;
    private String category;
    private String comment;
    private boolean followUpRequested;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public Integer getWaitTimeRating() { return waitTimeRating; }
    public void setWaitTimeRating(Integer waitTimeRating) { this.waitTimeRating = waitTimeRating; }
    public Integer getStaffRating() { return staffRating; }
    public void setStaffRating(Integer staffRating) { this.staffRating = staffRating; }
    public Integer getDoctorRating() { return doctorRating; }
    public void setDoctorRating(Integer doctorRating) { this.doctorRating = doctorRating; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public boolean isFollowUpRequested() { return followUpRequested; }
    public void setFollowUpRequested(boolean followUpRequested) { this.followUpRequested = followUpRequested; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
