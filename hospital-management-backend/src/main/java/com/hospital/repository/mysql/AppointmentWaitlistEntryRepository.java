package com.hospital.repository.mysql;

import com.hospital.model.AppointmentWaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentWaitlistEntryRepository extends JpaRepository<AppointmentWaitlistEntry, Long> {
    List<AppointmentWaitlistEntry> findAllByOrderByUpdatedAtDesc();
    List<AppointmentWaitlistEntry> findByPatient_IdOrderByUpdatedAtDesc(Long patientId);
    long countByStatus(String status);
    long countByPriority(String priority);
}
