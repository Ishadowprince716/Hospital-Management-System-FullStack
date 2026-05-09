package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.MedicalRecord;
import com.hospital.service.MedicalRecordService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/medical-records", "/api/v1/medical-records"})
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecord>> createMedicalRecord(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordService.createMedicalRecord(
                request.appointmentId(),
                request.diagnosis(),
                request.prescription(),
                request.notes(),
                request.treatmentPlan());
        return ResponseEntity.status(201).body(ApiResponse.success(record, "Medical record created successfully"));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<MedicalRecord>>> getPatientHistory(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getPatientMedicalRecords(patientId, pageable)));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<MedicalRecord>> getByAppointment(@PathVariable Long appointmentId) {
        MedicalRecord record = medicalRecordService.getRecordByAppointment(appointmentId);
        if (record != null) {
            return ResponseEntity.ok(ApiResponse.success(record));
        }
        return ResponseEntity.ok(ApiResponse.error("Medical record not found for this appointment"));
    }

    public record MedicalRecordRequest(
            @NotNull(message = "Appointment ID is required") Long appointmentId,
            @NotBlank(message = "Diagnosis is required") String diagnosis,
            String prescription,
            String notes,
            String treatmentPlan) {
    }
}
