package com.hospital.repository.mysql;

import com.hospital.model.AdmissionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionLogRepository extends JpaRepository<AdmissionLog, Long> {
    List<AdmissionLog> findByPatientId(Long patientId);
    List<AdmissionLog> findByBedIdAndDischargeDateIsNull(Long bedId);
}
