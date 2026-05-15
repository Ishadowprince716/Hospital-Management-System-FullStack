package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.HousekeepingRequestDTO;
import com.hospital.service.HousekeepingRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
@CrossOrigin(origins = "*")
public class HousekeepingRequestController {

    private final HousekeepingRequestService housekeepingService;

    public HousekeepingRequestController(HousekeepingRequestService housekeepingService) {
        this.housekeepingService = housekeepingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HousekeepingRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(housekeepingService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<HousekeepingRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(housekeepingService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(housekeepingService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HousekeepingRequestDTO>> create(@RequestBody HousekeepingRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(housekeepingService.create(request), "Housekeeping request submitted"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<HousekeepingRequestDTO>> update(@PathVariable Long id, @RequestBody HousekeepingRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(housekeepingService.update(id, request), "Housekeeping request updated"));
    }
}
