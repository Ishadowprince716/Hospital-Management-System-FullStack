package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.DischargePlanDTO;
import com.hospital.service.DischargePlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discharge-plans")
@CrossOrigin(origins = "*")
public class DischargePlanController {

    private final DischargePlanService dischargePlanService;

    public DischargePlanController(DischargePlanService dischargePlanService) {
        this.dischargePlanService = dischargePlanService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DischargePlanDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(dischargePlanService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<DischargePlanDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(dischargePlanService.getByPatient(patientId)));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DischargePlanDTO>>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(dischargePlanService.getByDoctor(doctorId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dischargePlanService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DischargePlanDTO>> create(@RequestBody DischargePlanDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(dischargePlanService.create(request), "Discharge plan created"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<DischargePlanDTO>> update(@PathVariable Long id, @RequestBody DischargePlanDTO request) {
        return ResponseEntity.ok(ApiResponse.success(dischargePlanService.update(id, request), "Discharge plan updated"));
    }
}
