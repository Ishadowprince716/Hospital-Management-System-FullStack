package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Bill;
import com.hospital.model.Doctor;
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
import org.springframework.data.domain.PageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    private static final Pattern CURRENT_DATE_TIME_QUERY = Pattern.compile(
            "\\b(today(?:'s)?\\s+(?:date|day|time)|current\\s+(?:date|time|day)|date\\s+with\\s+time|what(?:'s|\\s+is)?\\s+(?:the\\s+)?(?:date|time|day)|time\\s+now|date\\s+today)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PATIENT_APPOINTMENT_QUERY = Pattern.compile(
            "\\b(my|next|upcoming|recent|show|list|view|status)\\b[^.?!]*\\bappointments?\\b|\\bappointments?\\b[^.?!]*\\b(my|next|upcoming|recent|show|list|view|status)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PATIENT_BILLING_QUERY = Pattern.compile(
            "\\b(my|pending|paid|unpaid|show|list|view|status)\\b[^.?!]*\\b(bill|bills|billing|invoice|payment|payments)\\b|\\b(bill|bills|billing|invoice|payment|payments)\\b[^.?!]*\\b(my|pending|paid|unpaid|show|list|view|status)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PATIENT_PRESCRIPTION_QUERY = Pattern.compile(
            "\\b(my|active|show|list|view|latest|current)\\b[^.?!]*\\b(prescription|prescriptions|medicine|medicines|medication|medications)\\b|\\b(prescription|prescriptions|medicine|medicines|medication|medications)\\b[^.?!]*\\b(my|active|show|list|view|latest|current)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter DISPLAY_TIME = DateTimeFormatter.ofPattern("h:mm a z", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_DATE = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    @Value("${ai.gemini.api-key}")
    private String geminiApiKeys;

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

    @CircuitBreaker(name = "aiService", fallbackMethod = "analyzeSymptomsFallback")
    public TriageResponseDTO analyzeSymptoms(String symptoms) {
        String prompt = "You are a professional medical triage assistant. Analyze the following patient symptoms and recommend the most appropriate medical specialization.\n\n" +
                "Symptoms: " + symptoms + "\n\n" +
                "Valid specializations: Cardiology, Dermatology, Pediatrics, Orthopedics, Gynecology, Neurology, ENT (Otolaryngology), General Practice, Oncology, Psychiatry.\n\n" +
                "Respond ONLY with a JSON object in this format:\n" +
                "{\n" +
                "  \"recommendedSpecialization\": \"SPECIALIZATION\",\n" +
                "  \"urgencyLevel\": \"LOW/MEDIUM/HIGH/EMERGENCY\",\n" +
                "  \"analysisSummary\": \"Professional clinical assessment of the symptoms and next steps.\"\n" +
                "}\n" +
                "If it seems like a life-threatening emergency, set urgencyLevel to 'EMERGENCY' and advise immediate ER visit.";

        String rawResponse = callGeminiInternal(prompt);
        return parseJsonResponse(rawResponse, TriageResponseDTO.class);
    }

    @CircuitBreaker(name = "aiService", fallbackMethod = "getDifferentialDiagnosisFallback")
    public String getDifferentialDiagnosis(String symptoms, String medicalHistory) {
        String prompt = "You are a Clinical Decision Support System. Based on the following symptoms and medical history, provide a list of 3-5 potential differential diagnoses.\n\n" +
                "Symptoms: " + symptoms + "\n" +
                "Medical History: " + medicalHistory + "\n\n" +
                "For each potential diagnosis, provide:\n" +
                "1. Probability (High/Medium/Low)\n" +
                "2. Rational for inclusion\n" +
                "3. Recommended diagnostic tests\n\n" +
                "Format the response as a clear, professional medical report using Markdown. Include a strong disclaimer that this is an AI-generated assessment for clinical support only.";

        return callGeminiInternal(prompt);
    }

    public String getDifferentialDiagnosisFallback(String symptoms, String medicalHistory, Throwable t) {
        return "### AI Assessment Unavailable\n\n" +
               "Differential diagnosis generation is currently offline. Please consult the patient's medical history and perform a physical examination for clinical assessment.";
    }

    private <T> T parseJsonResponse(String rawResponse, Class<T> valueType) {
        String cleanedJson = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
        try {
            return objectMapper.readValue(cleanedJson, valueType);
        } catch (Exception e) {
            logger.error("Failed to parse AI response: {}", rawResponse);
            throw new RuntimeException("Failed to parse AI-generated JSON response", e);
        }
    }

    public TriageResponseDTO analyzeSymptomsFallback(String symptoms, Throwable t) {
        System.err.println("[CircuitBreaker] Triage Analysis Error: " + t.getMessage());
        return getSimulatedTriageResponse(symptoms);
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

    @CircuitBreaker(name = "aiService", fallbackMethod = "getHealthSummaryFallback")
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

        String rawResponse = callGeminiInternal(prompt);
        String cleanedJson = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
        try {
            return objectMapper.readValue(cleanedJson, PatientInsightDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini patient insight response", e);
        }
    }

    public PatientInsightDTO getHealthSummaryFallback(Long patientId, Throwable t) {
        System.err.println("[CircuitBreaker] Health Summary Analysis Error: " + t.getMessage());
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        return getSimulatedPatientInsight(patient, prescriptions);
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
        return getChatResponse(message, role, history, null, null, null);
    }

    @CircuitBreaker(name = "aiService", fallbackMethod = "getChatResponseFallback")
    public String getChatResponse(String message, String role, List<Map<String, String>> history, Long userId, String clientTime, String clientTimeZone) {
        TimeContext timeContext = resolveTimeContext(clientTime, clientTimeZone);
        if (isCurrentDateTimeQuery(message)) {
            return buildCurrentDateTimeAnswer(timeContext);
        }

        Optional<String> portalAnswer = tryHandlePatientPortalQuery(message, role, userId, timeContext);
        if (portalAnswer.isPresent()) {
            return portalAnswer.get();
        }

        String systemPrompt = role != null && role.equalsIgnoreCase("DOCTOR") ?
            "You are MediMate AI, a clinical decision support assistant. Provide professional, evidence-based medical information." :
            "You are MediMate AI, a helpful hospital assistant. Provide general health info and portal guidance. Do not diagnose.";

        String liveContext = "Live HMS context:\n" +
                "- Current user-local date/time: " + timeContext.displayDateTime() + "\n" +
                "- Current user timezone: " + timeContext.zoneId().getId() + "\n" +
                "- Current UTC instant: " + Instant.now() + "\n" +
                "Use this live context for any question about today, current date, current time, or now. " +
                "Do not invent dates or times. If the user asks for live external data outside the hospital portal, be honest that live web search is not connected.";

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
        currentContent.put("parts", Collections.singletonList(Collections.singletonMap("text", systemPrompt + "\n\n" + liveContext + "\n\nUser Message: " + message)));
        contents.add(currentContent);

        requestBody.put("contents", contents);
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.2,
                "topP", 0.8,
                "maxOutputTokens", 1024
        ));

        Map<String, Object> response = callGeminiApi(requestBody);
        return extractText(response);
    }

    public String getChatResponseFallback(String message, String role, List<Map<String, String>> history, Long userId, String clientTime, String clientTimeZone, Throwable t) {
        System.err.println("[CircuitBreaker] Chat Response Error: " + t.getMessage());
        TimeContext timeContext = resolveTimeContext(clientTime, clientTimeZone);
        if (isCurrentDateTimeQuery(message)) {
            return buildCurrentDateTimeAnswer(timeContext);
        }
        Optional<String> portalAnswer = tryHandlePatientPortalQuery(message, role, userId, timeContext);
        if (portalAnswer.isPresent()) {
            return portalAnswer.get();
        }
        return "MediMate AI is connected through the backend, but the Gemini service is not available right now. Please try again in a moment.";
    }

    private boolean isCurrentDateTimeQuery(String message) {
        return message != null && CURRENT_DATE_TIME_QUERY.matcher(message).find();
    }

    private String buildCurrentDateTimeAnswer(TimeContext timeContext) {
        return String.format(
                "Today is %s, and the current time is %s (%s).",
                timeContext.now().format(DISPLAY_DATE),
                timeContext.now().format(DISPLAY_TIME),
                timeContext.zoneId().getId()
        );
    }

    private Optional<String> tryHandlePatientPortalQuery(String message, String role, Long userId, TimeContext timeContext) {
        if (message == null || role == null || !role.equalsIgnoreCase("PATIENT")) {
            return Optional.empty();
        }

        if (PATIENT_APPOINTMENT_QUERY.matcher(message).find()) {
            return Optional.of(buildPatientAppointmentsAnswer(userId, timeContext));
        }
        if (PATIENT_BILLING_QUERY.matcher(message).find()) {
            return Optional.of(buildPatientBillingAnswer(userId));
        }
        if (PATIENT_PRESCRIPTION_QUERY.matcher(message).find()) {
            return Optional.of(buildPatientPrescriptionsAnswer(userId));
        }
        return Optional.empty();
    }

    private String buildPatientAppointmentsAnswer(Long patientId, TimeContext timeContext) {
        if (patientId == null) {
            return "I need your patient account ID to check appointments. Please log in again and try.";
        }

        Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient == null) {
            return "I couldn't find your patient profile, so I can't load appointments right now.";
        }

        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId).stream()
                .sorted(Comparator
                        .comparing(Appointment::getAppointmentDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Appointment::getAppointmentTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        if (appointments.isEmpty()) {
            return "You don't have any appointments recorded yet. You can book one from Patient > Book Appointment.";
        }

        long upcomingCount = appointments.stream()
                .filter(a -> a.getAppointmentDate() != null)
                .filter(a -> !a.getAppointmentDate().isBefore(timeContext.now().toLocalDate()))
                .filter(a -> !isStatus(a.getStatus(), "CANCELLED") && !isStatus(a.getStatus(), "COMPLETED"))
                .count();

        StringBuilder response = new StringBuilder();
        response.append("I found ").append(appointments.size()).append(" appointment");
        if (appointments.size() != 1) {
            response.append("s");
        }
        response.append(" for you");
        if (upcomingCount > 0) {
            response.append(", including ").append(upcomingCount).append(" upcoming");
        }
        response.append(":\n\n");

        appointments.stream().limit(5).forEach(appointment -> response
                .append("- ")
                .append(formatDate(appointment.getAppointmentDate()))
                .append(" at ")
                .append(formatTime(appointment.getAppointmentTime()))
                .append(" with ")
                .append(formatDoctorName(appointment.getDoctor()))
                .append(" - ")
                .append(blankToFallback(appointment.getReason(), "General consultation"))
                .append(" (")
                .append(blankToFallback(appointment.getStatus(), "Scheduled"))
                .append(")\n"));

        return response.toString().trim();
    }

    private String buildPatientBillingAnswer(Long patientId) {
        if (patientId == null) {
            return "I need your patient account ID to check bills. Please log in again and try.";
        }

        List<Bill> bills = billRepository.findByPatientId(patientId, PageRequest.of(0, 20)).getContent();
        if (bills.isEmpty()) {
            return "You don't have any bills recorded yet.";
        }

        long pendingCount = bills.stream().filter(b -> !isStatus(b.getStatus(), "PAID")).count();
        double pendingAmount = bills.stream()
                .filter(b -> !isStatus(b.getStatus(), "PAID"))
                .mapToDouble(b -> b.getBalanceAmount() != null ? b.getBalanceAmount() : b.getAmount() != null ? b.getAmount() : 0.0)
                .sum();

        StringBuilder response = new StringBuilder();
        response.append("I found ").append(bills.size()).append(" bill");
        if (bills.size() != 1) {
            response.append("s");
        }
        response.append(". Pending bills: ").append(pendingCount);
        if (pendingCount > 0) {
            response.append(" (balance ₹").append(String.format(Locale.ENGLISH, "%.2f", pendingAmount)).append(")");
        }
        response.append(".\n\n");

        bills.stream().limit(5).forEach(bill -> response
                .append("- ")
                .append(blankToFallback(bill.getBillNumber(), "Bill #" + bill.getId()))
                .append(": ₹")
                .append(String.format(Locale.ENGLISH, "%.2f", bill.getAmount() != null ? bill.getAmount() : 0.0))
                .append(" (")
                .append(blankToFallback(bill.getStatus(), "PENDING"))
                .append(")\n"));

        return response.toString().trim();
    }

    private String buildPatientPrescriptionsAnswer(Long patientId) {
        if (patientId == null) {
            return "I need your patient account ID to check prescriptions. Please log in again and try.";
        }

        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId);
        if (prescriptions.isEmpty()) {
            return "You don't have any prescriptions recorded yet.";
        }

        StringBuilder response = new StringBuilder();
        response.append("I found ").append(prescriptions.size()).append(" prescription");
        if (prescriptions.size() != 1) {
            response.append("s");
        }
        response.append(" for you:\n\n");

        prescriptions.stream().limit(5).forEach(prescription -> {
            String medicines = prescription.getItems() == null || prescription.getItems().isEmpty()
                    ? "No medicines listed"
                    : prescription.getItems().stream()
                            .map(PrescriptionItem::getMedicationName)
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.joining(", "));

            response
                    .append("- ")
                    .append(prescription.getPrescriptionDate() != null ? prescription.getPrescriptionDate().format(SHORT_DATE) : "Date not recorded")
                    .append(": ")
                    .append(blankToFallback(prescription.getDiagnosis(), "Diagnosis not recorded"))
                    .append(" - ")
                    .append(medicines)
                    .append(" (")
                    .append(blankToFallback(prescription.getStatus(), "ACTIVE"))
                    .append(")\n");
        });

        return response.toString().trim();
    }

    private boolean isStatus(String actual, String expected) {
        return actual != null && actual.equalsIgnoreCase(expected);
    }

    private String formatDoctorName(Doctor doctor) {
        if (doctor == null || doctor.getFullName() == null || doctor.getFullName().isBlank()) {
            return "the doctor";
        }
        String name = doctor.getFullName().trim();
        return name.matches("(?i)^dr\\.?\\s.*") ? name : "Dr. " + name;
    }

    private String formatDate(java.time.LocalDate date) {
        return date != null ? date.format(SHORT_DATE) : "Date not set";
    }

    private String formatTime(java.time.LocalTime time) {
        return time != null ? time.format(SHORT_TIME) : "Time not set";
    }

    private String blankToFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private TimeContext resolveTimeContext(String clientTime, String clientTimeZone) {
        ZoneId zoneId = resolveZoneId(clientTimeZone);
        ZonedDateTime now = ZonedDateTime.now(zoneId);

        if (clientTime != null && !clientTime.isBlank()) {
            try {
                now = Instant.parse(clientTime).atZone(zoneId);
            } catch (Exception ignored) {
                try {
                    now = ZonedDateTime.parse(clientTime).withZoneSameInstant(zoneId);
                } catch (Exception ignoredAgain) {
                    // Fall back to the server clock when the browser timestamp is malformed.
                }
            }
        }

        return new TimeContext(now, zoneId);
    }

    private ZoneId resolveZoneId(String clientTimeZone) {
        if (clientTimeZone != null && !clientTimeZone.isBlank()) {
            try {
                return ZoneId.of(clientTimeZone);
            } catch (Exception ignored) {
                // Fall back to server default for unknown browser timezone IDs.
            }
        }
        return ZoneId.systemDefault();
    }

    private record TimeContext(ZonedDateTime now, ZoneId zoneId) {
        String displayDateTime() {
            return now.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a z", Locale.ENGLISH));
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
        List<String> configuredKeys = getConfiguredGeminiApiKeys();
        if (configuredKeys.isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        RuntimeException lastError = null;
        for (int i = 0; i < configuredKeys.size(); i++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-goog-api-key", configuredKeys.get(i));

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                return restTemplate.postForObject(geminiApiEndpoint, entity, Map.class);
            } catch (RuntimeException e) {
                lastError = e;
                logger.warn("Gemini API call failed with configured key #{}: {}", i + 1, summarizeGeminiError(e));
            }
        }

        throw new RuntimeException("Gemini API call failed for all configured keys", lastError);
    }

    private List<String> getConfiguredGeminiApiKeys() {
        if (geminiApiKeys == null || geminiApiKeys.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(geminiApiKeys.split(","))
                .map(String::trim)
                .filter(key -> !key.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private String summarizeGeminiError(RuntimeException e) {
        if (e instanceof RestClientResponseException responseException) {
            String body = responseException.getResponseBodyAsString();
            body = body == null ? "" : body.replaceAll("\\s+", " ").trim();
            if (body.length() > 220) {
                body = body.substring(0, 220) + "...";
            }
            return responseException.getStatusCode() + (body.isBlank() ? "" : " - " + body);
        }
        return e.getClass().getSimpleName() + ": " + e.getMessage();
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
