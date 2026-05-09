package com.hospital.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentDTO {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
    private String appointmentType;
    private String reason;
    private String paymentStatus;
    private Double consultationFee;
}
