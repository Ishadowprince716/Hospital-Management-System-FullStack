package com.hospital.repository.mysql;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.MedicalRecord;
import com.hospital.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Optional<MedicalRecord> findById(Long id);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<MedicalRecord> findByPatient(Patient patient);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<MedicalRecord> findByDoctor(Doctor doctor);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Optional<MedicalRecord> findByAppointment(Appointment appointment);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<MedicalRecord> findByPatientOrderByCreatedAtDesc(Patient patient);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Page<MedicalRecord> findByPatient(Patient patient, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Page<MedicalRecord> findByDoctor(Doctor doctor, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
