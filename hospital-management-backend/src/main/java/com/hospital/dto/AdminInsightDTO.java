package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminInsightDTO {
    private String revenueRiskSummary;
    private List<String> bottleneckAlerts;
    private List<String> strategicRecommendations;
}
