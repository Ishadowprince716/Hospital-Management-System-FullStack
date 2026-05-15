package com.hospital.repository.mysql;

import com.hospital.model.EmergencyTransportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyTransportRequestRepository extends JpaRepository<EmergencyTransportRequest, Long> {
    List<EmergencyTransportRequest> findAllByOrderByUpdatedAtDesc();
    List<EmergencyTransportRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countBySeverity(String severity);
}
