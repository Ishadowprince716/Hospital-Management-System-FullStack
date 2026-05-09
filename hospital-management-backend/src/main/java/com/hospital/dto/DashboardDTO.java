package com.hospital.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDTO {
    private Long totalPatients;
    private Long totalDoctors;
    private Long todayAppointments;
    private Double totalRevenue;
}
