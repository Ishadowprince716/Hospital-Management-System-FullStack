package com.hospital.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class TelehealthSignalController {

    private static final List<String> ALLOWED_SIGNAL_TYPES = List.of(
            "join", "leave", "offer", "answer", "candidate", "renegotiate", "end"
    );

    private final Map<String, Map<String, Participant>> roomParticipants = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public TelehealthSignalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/telehealth.signal")
    public void relaySignal(@Payload Map<String, Object> payload) {
        Object appointmentId = payload.get("appointmentId");
        Object senderId = payload.get("senderId");
        Object senderName = payload.get("senderName");
        Object senderRole = payload.get("senderRole");
        Object type = payload.get("type");

        if (appointmentId == null || senderId == null || type == null) {
            return;
        }

        String signalType = String.valueOf(type);
        if (!ALLOWED_SIGNAL_TYPES.contains(signalType)) {
            return;
        }

        String appointmentKey = String.valueOf(appointmentId);
        String senderKey = String.valueOf(senderId);
        String senderNameValue = senderName == null || String.valueOf(senderName).isBlank()
                ? "Participant"
                : String.valueOf(senderName);
        String senderRoleValue = senderRole == null || String.valueOf(senderRole).isBlank()
                ? "UNKNOWN"
                : String.valueOf(senderRole);
        if (!isPayloadValid(signalType, payload)) {
            return;
        }

        if ("join".equals(signalType)) {
            roomParticipants
                    .computeIfAbsent(appointmentKey, ignored -> new ConcurrentHashMap<>())
                    .put(senderKey, new Participant(senderKey, senderNameValue, senderRoleValue));
        } else if ("leave".equals(signalType) || "end".equals(signalType)) {
            Map<String, Participant> participants = roomParticipants.get(appointmentKey);
            if (participants != null) {
                participants.remove(senderKey);
                if (participants.isEmpty()) {
                    roomParticipants.remove(appointmentKey);
                }
            }
        } else {
            roomParticipants
                    .computeIfAbsent(appointmentKey, ignored -> new ConcurrentHashMap<>())
                    .putIfAbsent(senderKey, new Participant(senderKey, senderNameValue, senderRoleValue));
        }

        Map<String, Object> normalized = new LinkedHashMap<>();
        normalized.put("appointmentId", appointmentId);
        normalized.put("senderId", senderKey);
        normalized.put("senderName", senderNameValue);
        normalized.put("senderRole", senderRoleValue);
        normalized.put("type", signalType);
        normalized.put("sentAt", Instant.now().toString());

        if (payload.containsKey("payload")) {
            normalized.put("payload", payload.get("payload"));
        }

        if (payload.containsKey("sdp")) {
            normalized.put("sdp", payload.get("sdp"));
        }

        if (payload.containsKey("candidate")) {
            normalized.put("candidate", payload.get("candidate"));
        }

        Map<String, Participant> participants = roomParticipants.get(appointmentKey);
        normalized.put("participants", participants == null
                ? List.of()
                : participants.values().stream().map(Participant::toMap).toList());

        messagingTemplate.convertAndSend("/topic/telehealth/signal/" + appointmentId, normalized);
    }

    private boolean isPayloadValid(String signalType, Map<String, Object> payload) {
        if ("offer".equals(signalType) || "answer".equals(signalType)) {
            return payload.get("sdp") instanceof Map;
        }

        if ("candidate".equals(signalType)) {
            return payload.get("candidate") instanceof Map;
        }

        return true;
    }

    private record Participant(String senderId, String senderName, String senderRole) {
        private Map<String, Object> toMap() {
            return Map.of(
                    "senderId", senderId,
                    "senderName", senderName,
                    "senderRole", senderRole
            );
        }
    }
}
