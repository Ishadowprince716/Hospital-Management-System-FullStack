package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.EmergencyTransportRequestDTO;
import com.hospital.service.EmergencyTransportRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency-transport")
@CrossOrigin(origins = "*")
public class EmergencyTransportRequestController {

    private final EmergencyTransportRequestService transportService;

    public EmergencyTransportRequestController(EmergencyTransportRequestService transportService) {
        this.transportService = transportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmergencyTransportRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(transportService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<EmergencyTransportRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(transportService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(transportService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyTransportRequestDTO>> create(@RequestBody EmergencyTransportRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(transportService.create(request), "Emergency transport requested"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<EmergencyTransportRequestDTO>> update(@PathVariable Long id, @RequestBody EmergencyTransportRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(transportService.update(id, request), "Emergency transport updated"));
    }
}
