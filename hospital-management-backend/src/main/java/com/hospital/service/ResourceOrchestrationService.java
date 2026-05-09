package com.hospital.service;

import com.hospital.model.AdmissionLog;
import com.hospital.model.Ward;
import com.hospital.repository.mysql.AdmissionLogRepository;
import com.hospital.repository.mysql.WardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResourceOrchestrationService {

    private final AIService aiService;
    private final WardRepository wardRepository;
    private final AdmissionLogRepository admissionLogRepository;

    public ResourceOrchestrationService(AIService aiService,
                                       WardRepository wardRepository,
                                       AdmissionLogRepository admissionLogRepository) {
        this.aiService = aiService;
        this.wardRepository = wardRepository;
        this.admissionLogRepository = admissionLogRepository;
    }

    public String predictUpcomingDemand() {
        // Collect historical data for the AI
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        List<AdmissionLog> historicalData = admissionLogRepository.findAll().stream()
                .filter(log -> log.getAdmissionDate().isAfter(oneYearAgo))
                .toList();

        // Group by week/month to see trends
        Map<String, Long> trends = historicalData.stream()
                .collect(Collectors.groupingBy(
                    log -> log.getAdmissionDate().getMonth().name(), 
                    Collectors.counting()
                ));

        String context = "Current Trends: " + trends.toString();
        
        // Use our Gemini AI to analyze these trends and predict demand
        String prompt = "You are a hospital resource optimizer. Analyze these historical admission counts by month and predict potential demand surges for the upcoming 30 days. Respond with a concise strategy for bed allocation.\n\n" + context;
        
        return aiService.getChatResponse(prompt, "ADMIN", null);
    }

    public Map<String, Double> getLiveCapacityHeatmap() {
        List<Ward> wards = wardRepository.findAll();
        Map<String, Double> heatmap = new HashMap<>();

        for (Ward ward : wards) {
            long occupied = ward.getBeds().stream()
                    .filter(b -> b.getStatus().name().equals("OCCUPIED"))
                    .count();
            double rate = (double) occupied / ward.getTotalCapacity();
            heatmap.put(ward.getName(), rate);
        }

        return heatmap;
    }
}
