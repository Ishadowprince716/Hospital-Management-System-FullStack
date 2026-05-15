package com.hospital.repository.mysql;

import com.hospital.model.DietaryMealRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DietaryMealRequestRepository extends JpaRepository<DietaryMealRequest, Long> {
    List<DietaryMealRequest> findAllByOrderByUpdatedAtDesc();
    List<DietaryMealRequest> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countByPriority(String priority);
}
