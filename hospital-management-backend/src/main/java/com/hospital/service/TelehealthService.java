package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.TelehealthSession;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.TelehealthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class TelehealthService {

    private final TelehealthRepository telehealthRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public TelehealthService(TelehealthRepository telehealthRepository, 
                            AppointmentRepository appointmentRepository,
                            NotificationService notificationService) {
        this.telehealthRepository = telehealthRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public TelehealthSession getOrCreateSession(Long appointmentId) {
        return telehealthRepository.findByAppointmentId(appointmentId)
                .map(this::normalizeSession)
                .orElseGet(() -> {
                    Appointment appointment = appointmentRepository.findById(appointmentId)
                            .orElseThrow(() -> new RuntimeException("Appointment not found"));
                    
                    String uniqueRoom = "HMS-ROOM-" + UUID.randomUUID().toString().substring(0, 8);
                    
                    TelehealthSession session = TelehealthSession.builder()
                            .appointment(appointment)
                            .roomName(uniqueRoom)
                            .roomToken(UUID.randomUUID().toString()) // In a real pro app, this would be a JWT for Jitsi
                            .isActive(true)
                            .status("READY")
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    return telehealthRepository.save(session);
                });
    }

    private TelehealthSession normalizeSession(TelehealthSession session) {
        if (session.getStatus() == null || session.getStatus().isBlank()) {
            session.setStatus(Boolean.TRUE.equals(session.getIsActive()) ? "READY" : "ENDED");
            return telehealthRepository.save(session);
        }
        return session;
    }

    @Transactional
    public void endSession(Long appointmentId) {
        telehealthRepository.findByAppointmentId(appointmentId).ifPresent(session -> {
            session.setIsActive(false);
            session.setStatus("ENDED");
            session.setEndedAt(LocalDateTime.now());
            session.setEndedReason("ENDED_BY_USER");
            telehealthRepository.save(session);
            sendCallEvent(session.getAppointment(), session, null, "CALL_ENDED");
        });
    }

    @Transactional
    public TelehealthSession startCall(Long appointmentId, String callerUsername, String callerRole) {
        TelehealthSession session = getOrCreateSession(appointmentId);
        LocalDateTime now = LocalDateTime.now();
        session.setIsActive(true);
        session.setStatus("CALLING");
        session.setLastInviteAt(now);
        if (session.getStartedAt() == null) {
            session.setStartedAt(now);
        }
        session.setDeclinedAt(null);
        session.setEndedAt(null);
        session.setEndedReason(null);
        session = telehealthRepository.save(session);
        sendCallEvent(session.getAppointment(), session, callerUsername, "CALL_INVITE");
        return session;
    }

    @Transactional
    public TelehealthSession declineCall(Long appointmentId, String callerUsername) {
        TelehealthSession session = getOrCreateSession(appointmentId);
        session.setIsActive(false);
        session.setStatus("DECLINED");
        session.setDeclinedAt(LocalDateTime.now());
        session = telehealthRepository.save(session);
        sendCallEvent(session.getAppointment(), session, callerUsername, "CALL_DECLINED");
        return session;
    }

    @Transactional
    public TelehealthSession markJoined(Long appointmentId, String callerUsername) {
        TelehealthSession session = getOrCreateSession(appointmentId);
        LocalDateTime now = LocalDateTime.now();
        session.setIsActive(true);
        session.setStatus("ACTIVE");
        if (session.getStartedAt() == null) {
            session.setStartedAt(now);
        }
        return telehealthRepository.save(session);
    }

    private void sendCallEvent(Appointment appointment, TelehealthSession session, String callerUsername, String eventType) {
        if (appointment == null || appointment.getDoctor() == null || appointment.getPatient() == null) {
            return;
        }

        boolean callerIsDoctor = callerUsername != null && callerUsername.equalsIgnoreCase(appointment.getDoctor().getUsername());
        boolean callerIsPatient = callerUsername != null && callerUsername.equalsIgnoreCase(appointment.getPatient().getUsername());
        String targetUsername = callerIsDoctor ? appointment.getPatient().getUsername() : appointment.getDoctor().getUsername();
        String targetUserId = String.valueOf(callerIsDoctor ? appointment.getPatient().getId() : appointment.getDoctor().getId());
        String callerName = callerIsDoctor
                ? appointment.getDoctor().getFullName()
                : callerIsPatient ? appointment.getPatient().getFullName() : "HMS Telehealth";
        String targetRole = callerIsDoctor ? "PATIENT" : "DOCTOR";

        Map<String, String> payload = new HashMap<>();
        payload.put("event", eventType);
        payload.put("appointmentId", String.valueOf(appointment.getId()));
        payload.put("roomName", session.getRoomName());
        payload.put("callerName", callerName != null ? callerName : "HMS Telehealth");
        payload.put("targetUsername", targetUsername);
        payload.put("targetUserId", targetUserId);
        payload.put("targetRole", targetRole);
        payload.put("title", "Telehealth consultation");
        payload.put("message", buildCallMessage(eventType, payload.get("callerName"), targetRole));
        notificationService.sendTelehealthCallNotification(payload);
    }

    private String buildCallMessage(String eventType, String callerName, String targetRole) {
        if ("CALL_ENDED".equals(eventType)) {
            return "Telehealth consultation ended.";
        }
        if ("CALL_DECLINED".equals(eventType)) {
            return "Telehealth consultation was declined.";
        }
        if ("PATIENT".equalsIgnoreCase(targetRole)) {
            return callerName + " started your video consultation. Join when you are ready.";
        }
        return "Your patient is waiting in the video consultation room.";
    }
}
