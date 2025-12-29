package com.hospital.repository.mysql;

import com.hospital.model.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {

    List<LabOrder> findByPatientIdOrderByOrderDateDesc(Long patientId);

    List<LabOrder> findByDoctorIdOrderByOrderDateDesc(Long doctorId);

    List<LabOrder> findByDoctorIdAndStatus(Long doctorId, String status);

    List<LabOrder> findByPatientIdAndStatus(Long patientId, String status);
}
