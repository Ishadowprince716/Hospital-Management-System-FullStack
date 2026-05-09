package com.hospital.repository.mysql;

import com.hospital.model.LabOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Optional<LabOrder> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Page<LabOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<LabOrder> findByPatientIdOrderByOrderDateDesc(Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Page<LabOrder> findByPatientId(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<LabOrder> findByDoctorIdOrderByOrderDateDesc(Long doctorId);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    Page<LabOrder> findByDoctorId(Long doctorId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<LabOrder> findByDoctorIdAndStatus(Long doctorId, String status);

    @EntityGraph(attributePaths = {"patient", "doctor", "appointment", "appointment.patient", "appointment.doctor"})
    List<LabOrder> findByPatientIdAndStatus(Long patientId, String status);
}
