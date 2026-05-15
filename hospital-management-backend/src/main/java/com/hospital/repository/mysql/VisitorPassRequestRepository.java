package com.hospital.repository.mysql;

import com.hospital.model.VisitorPassRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorPassRequestRepository extends JpaRepository<VisitorPassRequest, Long> {
    List<VisitorPassRequest> findAllByOrderByUpdatedAtDesc();
    List<VisitorPassRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countByRiskLevel(String riskLevel);
}
