package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.InsurancePreauthorizationDTO;
import com.hospital.service.InsurancePreauthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance-preauth")
@CrossOrigin(origins = "*")
public class InsurancePreauthorizationController {

    private final InsurancePreauthorizationService preauthService;

    public InsurancePreauthorizationController(InsurancePreauthorizationService preauthService) {
        this.preauthService = preauthService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InsurancePreauthorizationDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(preauthService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<InsurancePreauthorizationDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(preauthService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(preauthService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InsurancePreauthorizationDTO>> create(@RequestBody InsurancePreauthorizationDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(preauthService.create(request), "Insurance preauthorization submitted"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<InsurancePreauthorizationDTO>> update(@PathVariable Long id, @RequestBody InsurancePreauthorizationDTO request) {
        return ResponseEntity.ok(ApiResponse.success(preauthService.update(id, request), "Insurance preauthorization updated"));
    }
}
