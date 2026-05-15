package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.MedicationRefillRequestDTO;
import com.hospital.service.MedicationRefillRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medication-refills")
@CrossOrigin(origins = "*")
public class MedicationRefillRequestController {

    private final MedicationRefillRequestService refillService;

    public MedicationRefillRequestController(MedicationRefillRequestService refillService) {
        this.refillService = refillService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicationRefillRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(refillService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicationRefillRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(refillService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(refillService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicationRefillRequestDTO>> create(@RequestBody MedicationRefillRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(refillService.create(request), "Medication refill requested"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicationRefillRequestDTO>> update(@PathVariable Long id, @RequestBody MedicationRefillRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(refillService.update(id, request), "Medication refill updated"));
    }
}
