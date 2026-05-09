package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientInsightDTO {
    private String recentHistorySummary;
    private List<String> activeMedications;
    private List<String> criticalAlerts;
    private List<String> recommendedActions;
}
