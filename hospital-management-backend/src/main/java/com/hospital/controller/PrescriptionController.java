package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Prescription;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/prescriptions", "/api/v1/prescriptions"})
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    /**
     * Get all prescriptions for a specific patient with pagination
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<Prescription>>> getPatientPrescriptions(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "prescriptionDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPatientPrescriptions(patientId, pageable)));
    }

    /**
     * Get all prescriptions for a specific doctor with pagination
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<Page<Prescription>>> getDoctorPrescriptions(
            @PathVariable Long doctorId,
            @PageableDefault(size = 10, sort = "prescriptionDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getDoctorPrescriptions(doctorId, pageable)));
    }

    /**
     * Get all prescriptions with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Prescription>>> getAllPrescriptions(
            @PageableDefault(size = 10, sort = "prescriptionDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getAllPrescriptions(pageable)));
    }

    /**
     * Get a specific prescription by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionById(id)));
    }

    /**
     * Create a new prescription (POST)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(@Valid @RequestBody Prescription prescription) {
        Prescription saved = prescriptionService.createPrescription(prescription);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Prescription created successfully"));
    }

    /**
     * Fully update a prescription (PUT)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Prescription>> updatePrescriptionFull(
            @PathVariable Long id,
            @Valid @RequestBody Prescription prescription) {
        Prescription updated = prescriptionService.updatePrescriptionFull(id, prescription);
        return ResponseEntity.ok(ApiResponse.success(updated, "Prescription updated successfully"));
    }

    /**
     * Partially update prescription status (PATCH)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Prescription>> updatePrescriptionStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Prescription updated = prescriptionService.updatePrescriptionStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Prescription status patched successfully"));
    }

    /**
     * Delete a prescription (DELETE)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Prescription deleted successfully"));
    }

    /**
     * Check resource existence / headers without downloading body (HEAD)
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkPrescriptionExists(@PathVariable Long id) {
        prescriptionService.getPrescriptionById(id); // Will throw 404 if not found
        return ResponseEntity.ok().build();
    }
}
