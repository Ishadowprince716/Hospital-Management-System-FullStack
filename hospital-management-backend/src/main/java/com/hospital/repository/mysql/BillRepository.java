package com.hospital.repository.mysql;

import com.hospital.model.Bill;
import com.hospital.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Optional<Bill> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Bill> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient", "appointment.doctor", "items"})
    List<Bill> findByPatientOrderByGeneratedAtDesc(Patient patient);

    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Bill> findByPatient(Patient patient, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient", "appointment.doctor", "items"})
    Page<Bill> findByPatientId(Long patientId, Pageable pageable);

    List<Bill> findByStatus(String status);

    @Query(value = "SELECT MONTHNAME(created_at) as month, SUM(total_amount) as revenue FROM bills GROUP BY month ORDER BY MIN(created_at)", nativeQuery = true)
    List<Object[]> getMonthlyRevenue();

    @Query(value = "SELECT d.department as dept, SUM(b.total_amount) as revenue FROM bills b " +
           "JOIN appointments a ON b.appointment_id = a.id " +
           "JOIN doctors d ON a.doctor_id = d.user_id " +
           "GROUP BY d.department", nativeQuery = true)
    List<Object[]> getRevenueByDepartment();
}
