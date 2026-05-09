package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponseDTO {
    private String recommendedSpecialization;
    private String urgencyLevel;
    private String analysisSummary;
}
