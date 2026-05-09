package com.hospital.repository.mysql;

import com.hospital.model.MedicalReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientIdOrderByUploadDateDesc(Long patientId);

    Page<MedicalReport> findByPatientId(Long patientId, Pageable pageable);

    Page<MedicalReport> findAll(Pageable pageable);
}
