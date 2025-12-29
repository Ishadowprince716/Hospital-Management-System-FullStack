package com.hospital.repository.mysql;

import com.hospital.model.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {

    List<Allergy> findByPatientIdAndIsActiveTrue(Long patientId);

    List<Allergy> findByPatientId(Long patientId);
}
