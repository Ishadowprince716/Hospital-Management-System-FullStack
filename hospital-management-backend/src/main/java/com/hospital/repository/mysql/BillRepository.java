package com.hospital.repository.mysql;

import com.hospital.model.Bill;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByPatientOrderByGeneratedAtDesc(Patient patient);

    List<Bill> findByStatus(String status);
}
