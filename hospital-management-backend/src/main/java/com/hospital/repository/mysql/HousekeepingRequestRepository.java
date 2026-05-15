package com.hospital.repository.mysql;

import com.hospital.model.HousekeepingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HousekeepingRequestRepository extends JpaRepository<HousekeepingRequest, Long> {
    List<HousekeepingRequest> findAllByOrderByUpdatedAtDesc();
    List<HousekeepingRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countByPriority(String priority);
}
