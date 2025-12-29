package com.hospital.repository.mysql;

import com.hospital.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);

    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(Long doctorId);

    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);

    List<Prescription> findByDoctorIdAndStatus(Long doctorId, String status);
}
