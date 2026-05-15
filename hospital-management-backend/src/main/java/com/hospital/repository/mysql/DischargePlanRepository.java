package com.hospital.repository.mysql;

import com.hospital.model.DischargePlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DischargePlanRepository extends JpaRepository<DischargePlan, Long> {
    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<DischargePlan> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<DischargePlan> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<DischargePlan> findByDoctor_IdOrderByUpdatedAtDesc(Long doctorId);

    long countByStatus(String status);

    long countByBillingClearedFalse();
}
