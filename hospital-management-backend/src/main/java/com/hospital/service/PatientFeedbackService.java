package com.hospital.service;

import com.hospital.dto.PatientFeedbackDTO;
import com.hospital.model.Appointment;
import com.hospital.model.Patient;
import com.hospital.model.PatientFeedback;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.PatientFeedbackRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Map;

@Service
public class PatientFeedbackService {

    private final PatientFeedbackRepository feedbackRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public PatientFeedbackService(PatientFeedbackRepository feedbackRepository,
                                  PatientRepository patientRepository,
                                  AppointmentRepository appointmentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<PatientFeedbackDTO> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<PatientFeedbackDTO> getPatientFeedback(Long patientId) {
        return feedbackRepository.findByPatient_IdOrderByCreatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Object> getStats() {
        List<PatientFeedback> feedback = feedbackRepository.findAllByOrderByCreatedAtDesc();
        DoubleSummaryStatistics ratingStats = feedback.stream()
                .map(PatientFeedback::getRating)
                .filter(rating -> rating != null)
                .mapToDouble(Integer::doubleValue)
                .summaryStatistics();
        long detractors = feedback.stream().filter(item -> item.getRating() != null && item.getRating() <= 3).count();
        long promoters = feedback.stream().filter(item -> item.getRating() != null && item.getRating() >= 5).count();
        return Map.of(
                "total", feedback.size(),
                "averageRating", ratingStats.getCount() == 0 ? 0 : ratingStats.getAverage(),
                "followUps", feedbackRepository.countByFollowUpRequestedTrue(),
                "detractors", detractors,
                "promoters", promoters
        );
    }

    @Transactional
    public PatientFeedbackDTO createFeedback(PatientFeedbackDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        PatientFeedback feedback = new PatientFeedback();
        feedback.setPatient(patient);
        feedback.setAppointment(appointment);
        feedback.setRating(clampRating(request.getRating()));
        feedback.setWaitTimeRating(clampNullableRating(request.getWaitTimeRating()));
        feedback.setStaffRating(clampNullableRating(request.getStaffRating()));
        feedback.setDoctorRating(clampNullableRating(request.getDoctorRating()));
        feedback.setCategory(clean(request.getCategory(), "General"));
        feedback.setComment(clean(request.getComment(), ""));
        feedback.setFollowUpRequested(request.isFollowUpRequested());
        return toDto(feedbackRepository.save(feedback));
    }

    private Integer clampRating(Integer rating) {
        if (rating == null) return 5;
        return Math.max(1, Math.min(5, rating));
    }

    private Integer clampNullableRating(Integer rating) {
        return rating == null ? null : clampRating(rating);
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private PatientFeedbackDTO toDto(PatientFeedback feedback) {
        PatientFeedbackDTO dto = new PatientFeedbackDTO();
        dto.setId(feedback.getId());
        dto.setPatientId(feedback.getPatient().getId());
        dto.setPatientName(feedback.getPatient().getFullName() != null ? feedback.getPatient().getFullName() : feedback.getPatient().getUsername());
        dto.setAppointmentId(feedback.getAppointment() != null ? feedback.getAppointment().getId() : null);
        dto.setDoctorName(feedback.getAppointment() != null && feedback.getAppointment().getDoctor() != null
                ? feedback.getAppointment().getDoctor().getFullName()
                : null);
        dto.setRating(feedback.getRating());
        dto.setWaitTimeRating(feedback.getWaitTimeRating());
        dto.setStaffRating(feedback.getStaffRating());
        dto.setDoctorRating(feedback.getDoctorRating());
        dto.setCategory(feedback.getCategory());
        dto.setComment(feedback.getComment());
        dto.setFollowUpRequested(feedback.isFollowUpRequested());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
