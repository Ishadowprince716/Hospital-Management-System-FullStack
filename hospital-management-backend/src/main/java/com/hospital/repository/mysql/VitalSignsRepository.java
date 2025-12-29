package com.hospital.repository.mysql;

import com.hospital.model.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {

    List<VitalSigns> findByPatientIdOrderByRecordedAtDesc(Long patientId);

    List<VitalSigns> findTop10ByPatientIdOrderByRecordedAtDesc(Long patientId);
}
