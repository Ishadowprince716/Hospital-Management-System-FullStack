package com.hospital.repository.mysql;

import com.hospital.model.ReferralRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRequestRepository extends JpaRepository<ReferralRequest, Long> {
    @EntityGraph(attributePaths = {"patient", "referringDoctor"})
    List<ReferralRequest> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"patient", "referringDoctor"})
    List<ReferralRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"patient", "referringDoctor"})
    List<ReferralRequest> findByReferringDoctor_IdOrderByUpdatedAtDesc(Long doctorId);

    long countByStatus(String status);
    long countByPriority(String priority);
}
