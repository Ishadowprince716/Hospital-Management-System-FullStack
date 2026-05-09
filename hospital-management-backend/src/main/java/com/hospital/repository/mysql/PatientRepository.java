package com.hospital.repository.mysql;

import com.hospital.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByBloodGroup(String bloodGroup);

    List<Patient> findByGender(String gender);

    Optional<Patient> findByUsername(String username);

    boolean existsByUsername(String username);

    Page<Patient> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);
}
