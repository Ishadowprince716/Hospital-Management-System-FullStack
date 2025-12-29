package com.hospital.repository.mysql;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.MedicalRecord;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatient(Patient patient);

    List<MedicalRecord> findByDoctor(Doctor doctor);

    Optional<MedicalRecord> findByAppointment(Appointment appointment);

    // Order by date descending usually useful
    List<MedicalRecord> findByPatientOrderByCreatedAtDesc(Patient patient);

    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
