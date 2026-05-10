package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.TriageRequestDTO;
import com.hospital.dto.TriageResponseDTO;
import com.hospital.dto.PatientInsightDTO;
import com.hospital.dto.AdminInsightDTO;
import com.hospital.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * AI Controller - Secure Gemini API Integration
 * Handles all AI requests securely from the backend
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * AI Clinical Navigator - Symptom Triage
     * Analyzes symptoms and recommends a medical specialization
     */
    @PostMapping("/triage")
    public ResponseEntity<ApiResponse<TriageResponseDTO>> triage(@RequestBody TriageRequestDTO request) {
        try {
            if (request.getSymptoms() == null || request.getSymptoms().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Symptoms cannot be empty"));
            }

            TriageResponseDTO response = aiService.analyzeSymptoms(request.getSymptoms());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Error analyzing symptoms: " + e.getMessage()));
        }
    }

    /**
     * Send a message to Gemini AI Agent
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendMessage(@RequestBody ChatRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Message cannot be empty"));
            }

            String aiMessage = aiService.getChatResponse(
                request.getMessage(),
                request.getRole(),
                request.getConversationHistory(),
                request.getUserId(),
                request.getClientTime(),
                request.getClientTimeZone()
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", aiMessage);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Error processing request: " + e.getMessage()));
        }
    }

    /**
     * Get automated health summary for a patient
     */
    @GetMapping("/health-summary/{patientId}")
    public ResponseEntity<ApiResponse<PatientInsightDTO>> getHealthSummary(@PathVariable Long patientId) {
        try {
            PatientInsightDTO insight = aiService.getHealthSummary(patientId);
            return ResponseEntity.ok(ApiResponse.success(insight));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to generate summary: " + e.getMessage()));
        }
    }

    /**
     * AI Ops Guard - Administrative Insights
     * Generates high-level strategic insights for hospital admins
     */
    @GetMapping("/admin-insights")
    public ResponseEntity<ApiResponse<AdminInsightDTO>> getAdminInsights() {
        try {
            AdminInsightDTO insights = aiService.generateAdminInsights();
            return ResponseEntity.ok(ApiResponse.success(insights));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Error generating admin insights: " + e.getMessage()));
        }
    }

    /**
     * AI Diagnosis Support - For Doctors
     * Generates potential differential diagnoses based on symptoms and history
     */
    @PostMapping("/diagnosis")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDiagnosis(@RequestBody DiagnosisRequest request) {
        try {
            String diagnosis = aiService.getDifferentialDiagnosis(request.getSymptoms(), request.getMedicalHistory());
            Map<String, String> response = new HashMap<>();
            response.put("diagnosis", diagnosis);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Error generating diagnosis: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("ai_service", "operational");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Request DTO
     */
    public static class ChatRequest {
        private String message;
        private String role;
        private Long userId;
        private String clientTime;
        private String clientTimeZone;
        private List<Map<String, String>> conversationHistory;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getRole() { return role != null ? role : "PATIENT"; }
        public void setRole(String role) { this.role = role; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getClientTime() { return clientTime; }
        public void setClientTime(String clientTime) { this.clientTime = clientTime; }
        public String getClientTimeZone() { return clientTimeZone; }
        public void setClientTimeZone(String clientTimeZone) { this.clientTimeZone = clientTimeZone; }
        public List<Map<String, String>> getConversationHistory() { return conversationHistory; }
        public void setConversationHistory(List<Map<String, String>> conversationHistory) { this.conversationHistory = conversationHistory; }
    }

    public static class DiagnosisRequest {
        private String symptoms;
        private String medicalHistory;

        public String getSymptoms() { return symptoms; }
        public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
        public String getMedicalHistory() { return medicalHistory; }
        public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }
    }
}
