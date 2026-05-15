package com.hospital.repository.mysql;

import com.hospital.model.SafetyIncident;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyIncidentRepository extends JpaRepository<SafetyIncident, Long> {
    @EntityGraph(attributePaths = {"reportedBy"})
    List<SafetyIncident> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"reportedBy"})
    List<SafetyIncident> findByReportedBy_IdOrderByUpdatedAtDesc(Long reporterId);

    long countByStatus(String status);

    long countBySeverity(String severity);
}
