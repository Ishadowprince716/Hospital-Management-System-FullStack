package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Patient;
import com.hospital.model.Prescription;
import com.hospital.model.PrescriptionItem;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.PrescriptionRepository;
import com.hospital.dto.TriageResponseDTO;
import com.hospital.dto.PatientInsightDTO;
import com.hospital.dto.AdminInsightDTO;
import com.hospital.repository.mysql.BillRepository;
import com.hospital.repository.mysql.DoctorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.api-endpoint}")
    private String geminiApiEndpoint;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public TriageResponseDTO analyzeSymptoms(String symptoms) {
        String prompt = "You are a medical triage assistant. Analyze the following patient symptoms and recommend a medical specialization.\n\n" +
                "Symptoms: " + symptoms + "\n\n" +
                "Valid specializations in our hospital: Cardiology, Dermatology, Pediatrics, Orthopedics, Gynecology, Neurology, ENT (Otolaryngology), General Practice.\n\n" +
                "Respond ONLY with a JSON object in this format (no markdown blocks, no other text):\n" +
                "{\n" +
                "  \"recommendedSpecialization\": \"SPECIALIZATION\",\n" +
                "  \"urgencyLevel\": \"LOW/MEDIUM/HIGH\",\n" +
                "  \"analysisSummary\": \"Brief explanation of why this specialization is recommended and what the patient should do next.\"\n" +
                "}\n" +
                "If symptoms are too vague, recommend 'General Practice'. If it seems like an emergency, set urgencyLevel to 'HIGH'.";

        try {
            String rawResponse = callGeminiInternal(prompt);
            String cleanedJson = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(cleanedJson, TriageResponseDTO.class);
        } catch (Exception e) {
            System.err.println("Triage Analysis Error: " + e.getMessage());
            return getSimulatedTriageResponse(symptoms);
        }
    }

    private TriageResponseDTO getSimulatedTriageResponse(String symptoms) {
        TriageResponseDTO response = new TriageResponseDTO();
        String lowerSymptoms = symptoms.toLowerCase();
        
        if (lowerSymptoms.contains("heart") || lowerSymptoms.contains("chest")) {
            response.setRecommendedSpecialization("Cardiology");
            response.setUrgencyLevel("HIGH");
            response.setAnalysisSummary("Chest pain or heart-related symptoms require immediate cardiovascular evaluation.");
        } else if (lowerSymptoms.contains("skin") || lowerSymptoms.contains("rash")) {
            response.setRecommendedSpecialization("Dermatology");
            response.setUrgencyLevel("LOW");
            response.setAnalysisSummary("Skin issues or rashes are best handled by a dermatologist.");
        } else if (lowerSymptoms.contains("child") || lowerSymptoms.contains("baby")) {
            response.setRecommendedSpecialization("Pediatrics");
            response.setUrgencyLevel("MEDIUM");
            response.setAnalysisSummary("For pediatric patients, a specialist in child health is recommended.");
        } else if (lowerSymptoms.contains("bone") || lowerSymptoms.contains("joint") || lowerSymptoms.contains("fracture")) {
            response.setRecommendedSpecialization("Orthopedics");
            response.setUrgencyLevel("MEDIUM");
            response.setAnalysisSummary("Bone or joint issues require an orthopedic specialist.");
        } else {
            response.setRecommendedSpecialization("General Practice");
            response.setUrgencyLevel("LOW");
            response.setAnalysisSummary("Based on the symptoms, a general practitioner is a good first point of contact.");
        }
        return response;
    }

    public AdminInsightDTO generateAdminInsights() {
        long totalPendingBills = billRepository.findAll().stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .count();
        double totalUnpaidAmount = billRepository.findAll().stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();
        
        long upcomingAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "SCHEDULED".equalsIgnoreCase(a.getStatus()))
                .count();

        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();

        String context = String.format(
            "Hospital Stats: Total Patients=%d, Total Doctors=%d, Upcoming Scheduled Appointments=%d, " +
            "Total Pending Invoices=%d, Total Unpaid Revenue=₹%.2f",
            totalPatients, totalDoctors, upcomingAppointments, totalPendingBills, totalUnpaidAmount
        );

        String prompt = "You are a hospital operations analyst. Analyze the following high-level hospital data and provide strategic insights for the administrator.\n\n" +
                "Data:\n" + context + "\n\n" +
                "Respond ONLY with a JSON object in this format (no markdown blocks, no other text):\n" +
                "{\n" +
                "  \"revenueRiskSummary\": \"Concise summary of financial health and collection risks.\",\n" +
                "  \"bottleneckAlerts\": [\"Alert: High patient-to-doctor ratio\", \"Alert: Revenue leakage in billing\"],\n" +
                "  \"strategicRecommendations\": [\"Increase billing follow-ups\", \"Recruit more specialist staff\", \"Optimize slot allocation\"]\n" +
                "}\n" +
                "Be direct and focus on data-driven observations.";

        try {
            String rawResponse = callGeminiInternal(prompt);
            String cleanedJson = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(cleanedJson, AdminInsightDTO.class);
        } catch (Exception e) {
            System.err.println("Admin Insight Error: " + e.getMessage());
            return getSimulatedAdminInsight(totalUnpaidAmount, upcomingAppointments);
        }
    }

    private AdminInsightDTO getSimulatedAdminInsight(double unpaidAmount, long upcomingApts) {
        AdminInsightDTO insight = new AdminInsightDTO();
        insight.setRevenueRiskSummary(String.format("There is currently ₹%.2f in pending invoices. Focus on high-value collections to ensure cash flow.", unpaidAmount));
        
        List<String> alerts = new ArrayList<>();
        if (unpaidAmount > 5000) alerts.add("CRITICAL: Significant revenue currently tied up in pending bills.");
        if (upcomingApts > 20) alerts.add("OPERATION: High volume of scheduled appointments may require additional support staff.");
        insight.setBottleneckAlerts(alerts);
        
        insight.setStrategicRecommendations(Arrays.asList(
            "Implement automated SMS reminders for pending bills",
            "Review doctor-wise appointment distribution for workload balancing",
            "Consider loyalty discounts for early invoice settlement"
        ));
        
        return insight;
    }

    public PatientInsightDTO getHealthSummary(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);

        String context = String.format("Patient: %s, DOB: %s, Gender: %s, Allergies: %s, Medications: %s\n", 
            patient.getFullName(), patient.getDateOfBirth(), patient.getGender(), 
            patient.getAllergies(), patient.getCurrentMedications());
        
        context += "Recent Appointments:\n";
        context += appointments.stream()
                .limit(10)
                .map(a -> "- " + a.getAppointmentDate() + ": " + a.getReason() + " (" + a.getStatus() + ")")
                .collect(Collectors.joining("\n"));

        context += "\nPrescription History (Active/Past):\n";
        context += prescriptions.stream()
                .limit(10)
                .map(p -> "- " + (p.getPrescriptionDate() != null ? p.getPrescriptionDate() : "N/A") + ": Diagnosis=" + p.getDiagnosis())
                .collect(Collectors.joining("\n"));

        String prompt = "You are a medical analyst assistant for a doctor. Analyze the following patient data and provide a structured 30-second summary.\n\n" +
                "Data:\n" + context + "\n\n" +
                "Respond ONLY with a JSON object in this format (no markdown blocks, no other text):\n" +
                "{\n" +
                "  \"recentHistorySummary\": \"One or two sentence summary of the patient's recent clinical journey.\",\n" +
                "  \"activeMedications\": [\"Medication 1\", \"Medication 2\"],\n" +
                "  \"criticalAlerts\": [\"Warning: High BP trend\", \"Allergy: Penicillin\", \"Alert: Missed follow-up\"],\n" +
                "  \"recommendedActions\": [\"Suggest blood work\", \"Check adherence to BP meds\", \"Review kidney function\"]\n" +
                "}\n" +
                "Focus on what a doctor needs to know immediately. If there are no critical alerts, provide an empty list.";

        try {
            String rawResponse = callGeminiInternal(prompt);
            String cleanedJson = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(cleanedJson, PatientInsightDTO.class);
        } catch (Exception e) {
            System.err.println("Health Summary Analysis Error: " + e.getMessage());
            return getSimulatedPatientInsight(patient, prescriptions);
        }
    }

    private PatientInsightDTO getSimulatedPatientInsight(Patient patient, List<Prescription> prescriptions) {
        PatientInsightDTO insight = new PatientInsightDTO();
        insight.setRecentHistorySummary("Patient has a history of routine checkups. Recent records show stable health status.");
        
        List<String> meds = new ArrayList<>();
        if (prescriptions != null && !prescriptions.isEmpty()) {
            meds = prescriptions.stream()
                .flatMap(p -> p.getItems().stream())
                .map(PrescriptionItem::getMedicationName)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
        }
        if (meds.isEmpty()) meds.add("None currently recorded");
        insight.setActiveMedications(meds);
            
        List<String> alerts = new ArrayList<>();
        if (patient.getAllergies() != null && !patient.getAllergies().equalsIgnoreCase("none")) {
            alerts.add("KNOWN ALLERGY: " + patient.getAllergies());
        }
        insight.setCriticalAlerts(alerts);
        
        insight.setRecommendedActions(Arrays.asList(
            "Review current medication efficacy",
            "Update latest vital signs in record",
            "Discuss lifestyle changes"
        ));
        
        return insight;
    }

    public String getChatResponse(String message, String role, List<Map<String, String>> history) {
        String systemPrompt = role.equalsIgnoreCase("DOCTOR") ? 
            "You are a clinical decision support assistant. Provide professional, evidence-based medical information." :
            "You are a helpful hospital assistant. Provide general health info and portal guidance. Do not diagnose.";

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            for (Map<String, String> entry : history) {
                Map<String, Object> content = new HashMap<>();
                content.put("role", entry.get("role").equals("assistant") ? "model" : "user");
                content.put("parts", Collections.singletonList(Collections.singletonMap("text", entry.get("content"))));
                contents.add(content);
            }
        }

        Map<String, Object> currentContent = new HashMap<>();
        currentContent.put("role", "user");
        currentContent.put("parts", Collections.singletonList(Collections.singletonMap("text", systemPrompt + "\n\nUser Message: " + message)));
        contents.add(currentContent);

        requestBody.put("contents", contents);

        try {
            Map<String, Object> response = callGeminiApi(requestBody);
            return extractText(response);
        } catch (Exception e) {
            return "Simulated AI Response: As an AI assistant, I recommend consulting with our specialists for accurate medical guidance.";
        }
    }

    private String callGeminiInternal(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", Collections.singletonList(Collections.singletonMap("text", prompt)));
        requestBody.put("contents", Collections.singletonList(content));

        try {
            Map<String, Object> response = callGeminiApi(requestBody);
            return extractText(response);
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGeminiApi(Map<String, Object> requestBody) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        return restTemplate.postForObject(geminiApiEndpoint, entity, Map.class);
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
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
            return "No response generated";
        } catch (Exception e) {
            return "Extraction error: " + e.getMessage();
        }
    }
}
