package com.hospital.repository.mysql;

import com.hospital.model.ClinicalHandoff;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalHandoffRepository extends JpaRepository<ClinicalHandoff, Long> {
    @EntityGraph(attributePaths = {"createdBy"})
    List<ClinicalHandoff> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"createdBy"})
    List<ClinicalHandoff> findByCreatedBy_IdOrderByUpdatedAtDesc(Long createdById);

    long countByStatus(String status);

    long countByPriority(String priority);
}
