package com.hospital.repository.mysql;

import com.hospital.model.MedicalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {

    List<MedicalDocument> findByPatientIdOrderByUploadDateDesc(Long patientId);

    Page<MedicalDocument> findByPatientId(Long patientId, Pageable pageable);

    List<MedicalDocument> findByPatientIdAndDocumentType(Long patientId, String documentType);
}
