package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.PatientFeedbackDTO;
import com.hospital.service.PatientFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient-feedback")
@CrossOrigin(origins = "*")
public class PatientFeedbackController {

    private final PatientFeedbackService feedbackService;

    public PatientFeedbackController(PatientFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientFeedbackDTO>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllFeedback()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PatientFeedbackDTO>>> getPatientFeedback(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getPatientFeedback(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientFeedbackDTO>> createFeedback(@RequestBody PatientFeedbackDTO request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.success(feedbackService.createFeedback(request), "Feedback submitted"));
    }
}
