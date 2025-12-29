package com.hospital.repository.mysql;

import com.hospital.model.Billing;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {

    List<Billing> findByPatient(Patient patient);

    List<Billing> findByPaymentStatus(String paymentStatus);

    Optional<Billing> findByBillNumber(String billNumber);

    @Query("SELECT SUM(b.totalAmount) FROM Billing b WHERE b.paymentStatus = 'PAID' AND b.paidAt BETWEEN ?1 AND ?2")
    Double getTotalRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}
