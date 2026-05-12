package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.config.JwtUtil;
import com.hospital.dto.TelehealthSessionDTO;
import com.hospital.model.TelehealthSession;
import com.hospital.service.TelehealthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/telehealth")
public class TelehealthController {

    private final TelehealthService telehealthService;
    private final JwtUtil jwtUtil;
    private final String turnUrl;
    private final String turnUsername;
    private final String turnPassword;

    public TelehealthController(
            TelehealthService telehealthService,
            JwtUtil jwtUtil,
            @Value("${TELEHEALTH_TURN_URL:${telehealth.turn.url:}}") String turnUrl,
            @Value("${TELEHEALTH_TURN_USERNAME:${telehealth.turn.username:}}") String turnUsername,
            @Value("${TELEHEALTH_TURN_PASSWORD:${telehealth.turn.password:}}") String turnPassword) {
        this.telehealthService = telehealthService;
        this.jwtUtil = jwtUtil;
        this.turnUrl = turnUrl;
        this.turnUsername = turnUsername;
        this.turnPassword = turnPassword;
    }

    @GetMapping("/ice-config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIceConfig() {
        List<Map<String, Object>> iceServers = new ArrayList<>();
        boolean hasTurn = turnUrl != null && !turnUrl.isBlank();

        if (hasTurn) {
            Map<String, Object> turnServer = new LinkedHashMap<>();
            List<String> urls = List.of(turnUrl.split(","))
                    .stream()
                    .map(String::trim)
                    .filter(url -> !url.isBlank())
                    .collect(Collectors.toList());
            turnServer.put("urls", urls.size() == 1 ? urls.get(0) : urls);
            if (turnUsername != null && !turnUsername.isBlank()) {
                turnServer.put("username", turnUsername.trim());
            }
            if (turnPassword != null && !turnPassword.isBlank()) {
                turnServer.put("credential", turnPassword);
            }
            iceServers.add(turnServer);
        }

        // STUN fallback is always included for browser compatibility.
        iceServers.add(Map.of("urls", List.of("stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478")));

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "iceServers", iceServers,
                "turnConfigured", hasTurn
        )));
    }

    @GetMapping("/session/{appointmentId}")
    @Transactional
    public ResponseEntity<ApiResponse<TelehealthSessionDTO>> getSession(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(toDTO(telehealthService.getOrCreateSession(appointmentId))));
    }

    @PostMapping("/session/{appointmentId}/end")
    public ResponseEntity<ApiResponse<String>> endSession(@PathVariable Long appointmentId) {
        telehealthService.endSession(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Session ended"));
    }

    @PostMapping("/session/{appointmentId}/start")
    @Transactional
    public ResponseEntity<ApiResponse<TelehealthSessionDTO>> startSession(
            @PathVariable Long appointmentId,
            HttpServletRequest request) {
        TokenUser tokenUser = extractTokenUser(request);
        TelehealthSession session = telehealthService.startCall(appointmentId, tokenUser.username(), tokenUser.role());
        return ResponseEntity.ok(ApiResponse.success(toDTO(session), "Telehealth invite sent"));
    }

    @PostMapping("/session/{appointmentId}/decline")
    @Transactional
    public ResponseEntity<ApiResponse<TelehealthSessionDTO>> declineSession(
            @PathVariable Long appointmentId,
            HttpServletRequest request) {
        TokenUser tokenUser = extractTokenUser(request);
        TelehealthSession session = telehealthService.declineCall(appointmentId, tokenUser.username());
        return ResponseEntity.ok(ApiResponse.success(toDTO(session), "Telehealth call declined"));
    }

    @PostMapping("/session/{appointmentId}/join")
    @Transactional
    public ResponseEntity<ApiResponse<TelehealthSessionDTO>> joinSession(
            @PathVariable Long appointmentId,
            HttpServletRequest request) {
        TokenUser tokenUser = extractTokenUser(request);
        TelehealthSession session = telehealthService.markJoined(appointmentId, tokenUser.username());
        return ResponseEntity.ok(ApiResponse.success(toDTO(session), "Telehealth session is live"));
    }

    private TelehealthSessionDTO toDTO(TelehealthSession session) {
        var appointment = session.getAppointment();
        return TelehealthSessionDTO.builder()
                .id(session.getId())
                .appointmentId(appointment != null ? appointment.getId() : null)
                .roomName(session.getRoomName())
                .isActive(session.getIsActive())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .startedAt(session.getStartedAt())
                .lastInviteAt(session.getLastInviteAt())
                .declinedAt(session.getDeclinedAt())
                .endedAt(session.getEndedAt())
                .endedReason(session.getEndedReason())
                .appointmentDate(appointment != null ? appointment.getAppointmentDate() : null)
                .appointmentTime(appointment != null ? appointment.getAppointmentTime() : null)
                .doctorName(appointment != null && appointment.getDoctor() != null ? appointment.getDoctor().getFullName() : null)
                .patientName(appointment != null && appointment.getPatient() != null ? appointment.getPatient().getFullName() : null)
                .build();
    }

    private TokenUser extractTokenUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new TokenUser(null, null);
        }
        String token = authHeader.substring(7);
        try {
            return new TokenUser(jwtUtil.extractUsername(token), jwtUtil.extractRole(token));
        } catch (Exception e) {
            return new TokenUser(null, null);
        }
    }

    private record TokenUser(String username, String role) {}
}
