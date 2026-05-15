package com.hospital.repository.mysql;

import com.hospital.model.MedicationRefillRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRefillRequestRepository extends JpaRepository<MedicationRefillRequest, Long> {
    List<MedicationRefillRequest> findAllByOrderByUpdatedAtDesc();
    List<MedicationRefillRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countByPriority(String priority);
}
