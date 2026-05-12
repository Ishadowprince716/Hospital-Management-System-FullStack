package com.hospital.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class TelehealthSignalControllerTest {

    private SimpMessagingTemplate messagingTemplate;
    private TelehealthSignalController controller;

    @BeforeEach
    void setUp() {
        messagingTemplate = mock(SimpMessagingTemplate.class);
        controller = new TelehealthSignalController(messagingTemplate);
    }

    @Test
    @DisplayName("Valid join signal should be normalized and broadcast with participants")
    void relayJoinSignal() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("appointmentId", 99L);
        payload.put("senderId", "sender-a");
        payload.put("senderName", "Dr Rahul");
        payload.put("senderRole", "DOCTOR");
        payload.put("type", "join");

        controller.relaySignal(payload);

        ArgumentCaptor<Map<String, Object>> bodyCaptor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSend(
                org.mockito.ArgumentMatchers.eq("/topic/telehealth/signal/99"),
                bodyCaptor.capture()
        );

        Map<String, Object> relayed = bodyCaptor.getValue();
        assertThat(relayed.get("type")).isEqualTo("join");
        assertThat(relayed.get("senderId")).isEqualTo("sender-a");
        assertThat(relayed).containsKey("sentAt");
        assertThat(relayed.get("participants")).isInstanceOf(List.class);
        assertThat((List<?>) relayed.get("participants")).hasSize(1);
    }

    @Test
    @DisplayName("Offer signal without SDP payload should be dropped")
    void rejectInvalidOfferSignal() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("appointmentId", 99L);
        payload.put("senderId", "sender-a");
        payload.put("senderName", "Dr Rahul");
        payload.put("senderRole", "DOCTOR");
        payload.put("type", "offer");

        controller.relaySignal(payload);

        verifyNoInteractions(messagingTemplate);
    }
}
