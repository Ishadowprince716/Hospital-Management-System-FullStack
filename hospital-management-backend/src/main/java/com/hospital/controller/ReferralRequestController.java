package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.ReferralRequestDTO;
import com.hospital.service.ReferralRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/referrals")
@CrossOrigin(origins = "*")
public class ReferralRequestController {

    private final ReferralRequestService referralService;

    public ReferralRequestController(ReferralRequestService referralService) {
        this.referralService = referralService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(referralService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(referralService.getByPatient(patientId)));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<ReferralRequestDTO>>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(referralService.getByDoctor(doctorId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(referralService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> create(@RequestBody ReferralRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(referralService.create(request), "Referral created"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ReferralRequestDTO>> update(@PathVariable Long id, @RequestBody ReferralRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(referralService.update(id, request), "Referral updated"));
    }
}
