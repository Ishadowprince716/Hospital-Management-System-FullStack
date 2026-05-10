package com.hospital.repository.mysql;

import com.hospital.model.TelehealthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelehealthRepository extends JpaRepository<TelehealthSession, Long> {
    Optional<TelehealthSession> findByAppointmentId(Long appointmentId);
    Optional<TelehealthSession> findByRoomName(String roomName);
}
