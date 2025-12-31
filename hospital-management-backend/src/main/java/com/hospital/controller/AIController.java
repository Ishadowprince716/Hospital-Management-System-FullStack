package com.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import java.util.*;

/**
 * AI Controller - Secure Gemini API Integration
 * Handles all AI requests securely from the backend
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.api-endpoint}")
    private String geminiApiEndpoint;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    /**
     * Send a message to Gemini AI
     */
    @PostMapping("/chat")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Message cannot be empty"));
            }

            // Call Gemini API
            String url = geminiApiEndpoint + "?key=" + geminiApiKey;
            
            // Build request body
            Map<String, Object> requestBody = buildRequest(request);

            if (restTemplate == null) {
                throw new RuntimeException("RestTemplate not configured");
            }

            try {
                Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
                
                if (response != null && response.containsKey("candidates")) {
                    String aiMessage = extractResponse(response);
                    return ResponseEntity.ok(Collections.singletonMap("message", aiMessage));
                } else {
                    return ResponseEntity.status(500)
                        .body(Collections.singletonMap("error", "Invalid response from AI service"));
                }
            } catch (RestClientException e) {
                System.err.println("RestClient Error: " + e.getMessage());
                return ResponseEntity.status(503)
                    .body(Collections.singletonMap("error", "AI service unavailable"));
            }

        } catch (Exception e) {
            System.err.println("AI Controller Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Collections.singletonMap("error", "Error processing request: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("ai_service", "operational");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Build request for Gemini API
     */
    private Map<String, Object> buildRequest(ChatRequest request) {
        Map<String, Object> req = new HashMap<>();
        
        // Build contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", request.getMessage());
        parts.add(part);
        content.put("parts", parts);
        
        contents.add(content);
        req.put("contents", contents);

        // Generation config
        Map<String, Object> config = new HashMap<>();
        config.put("temperature", 0.7);
        config.put("maxOutputTokens", 500);
        req.put("generationConfig", config);

        return req;
    }

    /**
     * Extract AI response from Gemini response
     */
    @SuppressWarnings("unchecked")
    private String extractResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Unable to generate response";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    /**
     * Request DTO
     */
    public static class ChatRequest {
        private String message;
        private String role;
        private List<Map<String, String>> conversationHistory;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public List<Map<String, String>> getConversationHistory() {
            return conversationHistory;
        }

        public void setConversationHistory(List<Map<String, String>> conversationHistory) {
            this.conversationHistory = conversationHistory;
        }
    }
}
