package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.TelehealthSession;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.TelehealthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TelehealthService {

    private final TelehealthRepository telehealthRepository;
    private final AppointmentRepository appointmentRepository;

    public TelehealthService(TelehealthRepository telehealthRepository, 
                            AppointmentRepository appointmentRepository) {
        this.telehealthRepository = telehealthRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public TelehealthSession getOrCreateSession(Long appointmentId) {
        return telehealthRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> {
                    Appointment appointment = appointmentRepository.findById(appointmentId)
                            .orElseThrow(() -> new RuntimeException("Appointment not found"));
                    
                    String uniqueRoom = "HMS-ROOM-" + UUID.randomUUID().toString().substring(0, 8);
                    
                    TelehealthSession session = TelehealthSession.builder()
                            .appointment(appointment)
                            .roomName(uniqueRoom)
                            .roomToken(UUID.randomUUID().toString()) // In a real pro app, this would be a JWT for Jitsi
                            .isActive(true)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    return telehealthRepository.save(session);
                });
    }

    @Transactional
    public void endSession(Long appointmentId) {
        telehealthRepository.findByAppointmentId(appointmentId).ifPresent(session -> {
            session.setIsActive(false);
            session.setEndedAt(LocalDateTime.now());
            telehealthRepository.save(session);
        });
    }
}
