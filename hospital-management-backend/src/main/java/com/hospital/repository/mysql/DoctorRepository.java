package com.hospital.repository.mysql;

import com.hospital.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByDepartment(String department);

    List<Doctor> findByIsActive(Boolean isActive);

    Page<Doctor> findByIsActive(Boolean isActive, Pageable pageable);

    Optional<Doctor> findByUsername(String username);
}
