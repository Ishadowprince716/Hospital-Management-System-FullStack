package com.hospital.repository.mysql;

import com.hospital.model.InsurancePreauthorization;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePreauthorizationRepository extends JpaRepository<InsurancePreauthorization, Long> {
    @EntityGraph(attributePaths = {"patient"})
    List<InsurancePreauthorization> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"patient"})
    List<InsurancePreauthorization> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);

    long countByStatus(String status);

    long countByPriority(String priority);
}
