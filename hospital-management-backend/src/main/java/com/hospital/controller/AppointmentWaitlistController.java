package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.AppointmentWaitlistEntryDTO;
import com.hospital.service.AppointmentWaitlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointment-waitlist")
@CrossOrigin(origins = "*")
public class AppointmentWaitlistController {

    private final AppointmentWaitlistService waitlistService;

    public AppointmentWaitlistController(AppointmentWaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentWaitlistEntryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(waitlistService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentWaitlistEntryDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(waitlistService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(waitlistService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentWaitlistEntryDTO>> create(@RequestBody AppointmentWaitlistEntryDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(waitlistService.create(request), "Waitlist request submitted"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentWaitlistEntryDTO>> update(@PathVariable Long id, @RequestBody AppointmentWaitlistEntryDTO request) {
        return ResponseEntity.ok(ApiResponse.success(waitlistService.update(id, request), "Waitlist request updated"));
    }
}
