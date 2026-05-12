package com.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class TelehealthSessionDTO {
    private Long id;
    private Long appointmentId;
    private String roomName;
    private Boolean isActive;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime lastInviteAt;
    private LocalDateTime declinedAt;
    private LocalDateTime endedAt;
    private String endedReason;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String doctorName;
    private String patientName;
}
