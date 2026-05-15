package com.hospital.repository.mysql;

import com.hospital.model.PatientFeedback;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientFeedbackRepository extends JpaRepository<PatientFeedback, Long> {
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.doctor"})
    List<PatientFeedback> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.doctor"})
    List<PatientFeedback> findByPatient_IdOrderByCreatedAtDesc(Long patientId);

    long countByFollowUpRequestedTrue();
}
