package com.hospital.repository.mysql;

import com.hospital.model.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Optional<Prescription> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Prescription> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Prescription> findByPatientId(Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(Long doctorId);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Prescription> findByDoctorIdAndStatus(Long doctorId, String status);
}
