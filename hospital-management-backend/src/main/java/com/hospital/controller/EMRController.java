package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.*;
import com.hospital.service.EMRService;
import com.hospital.service.MedicalRecordService;
import com.hospital.service.PrescriptionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/emr", "/api/v1/emr"})
@CrossOrigin(origins = "*")
public class EMRController {

    private final EMRService emrService;
    private final MedicalRecordService medicalRecordService;
    private final PrescriptionService prescriptionService;

    public EMRController(EMRService emrService,
                         MedicalRecordService medicalRecordService,
                         PrescriptionService prescriptionService) {
        this.emrService = emrService;
        this.medicalRecordService = medicalRecordService;
        this.prescriptionService = prescriptionService;
    }

    // ========== Patient Complete EMR ==========
    @GetMapping("/patient/{patientId}/complete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompleteEMR(@PathVariable Long patientId) {
        Map<String, Object> emr = emrService.getCompleteEMR(patientId);
        return ResponseEntity.ok(ApiResponse.success(emr));
    }

    // ========== Vital Signs ==========
    @GetMapping("/patient/{patientId}/vitals")
    public ResponseEntity<ApiResponse<List<VitalSigns>>> getVitalSigns(@PathVariable Long patientId) {
        List<VitalSigns> vitals = emrService.getVitalSigns(patientId);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }

    @PostMapping("/patient/{patientId}/vitals")
    public ResponseEntity<ApiResponse<VitalSigns>> addVitalSigns(@PathVariable Long patientId, @RequestBody VitalSigns vitalSigns) {
        VitalSigns saved = emrService.addVitalSigns(patientId, vitalSigns);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Vital signs added successfully"));
    }

    // ========== Allergies ==========
    @GetMapping("/patient/{patientId}/allergies")
    public ResponseEntity<ApiResponse<List<Allergy>>> getAllergies(@PathVariable Long patientId) {
        List<Allergy> allergies = emrService.getAllergies(patientId);
        return ResponseEntity.ok(ApiResponse.success(allergies));
    }

    @PostMapping("/patient/{patientId}/allergies")
    public ResponseEntity<ApiResponse<Allergy>> addAllergy(@PathVariable Long patientId, @RequestBody Allergy allergy) {
        Allergy saved = emrService.addAllergy(patientId, allergy);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Allergy added successfully"));
    }

    @PatchMapping("/allergies/{allergyId}/status")
    public ResponseEntity<ApiResponse<Allergy>> updateAllergyStatus(@PathVariable Long allergyId, @RequestParam boolean isActive) {
        Allergy updated = emrService.updateAllergyStatus(allergyId, isActive);
        return ResponseEntity.ok(ApiResponse.success(updated, "Allergy status updated successfully"));
    }

    // ========== Medical History ==========
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<ApiResponse<Page<MedicalRecord>>> getMedicalHistory(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<MedicalRecord> history = medicalRecordService.getPatientMedicalRecords(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ========== Prescriptions ==========
    @GetMapping("/patient/{patientId}/prescriptions")
    public ResponseEntity<ApiResponse<Page<Prescription>>> getPatientPrescriptions(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("prescriptionDate").descending());
        Page<Prescription> prescriptions = prescriptionService.getPatientPrescriptions(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }

    @GetMapping("/doctor/{doctorId}/prescriptions")
    public ResponseEntity<ApiResponse<Page<Prescription>>> getDoctorPrescriptions(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("prescriptionDate").descending());
        Page<Prescription> prescriptions = prescriptionService.getDoctorPrescriptions(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(@RequestBody Prescription prescription) {
        Prescription saved = prescriptionService.createPrescription(prescription);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Prescription created successfully"));
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescription(@PathVariable Long id) {
        Prescription prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(prescription));
    }
}
