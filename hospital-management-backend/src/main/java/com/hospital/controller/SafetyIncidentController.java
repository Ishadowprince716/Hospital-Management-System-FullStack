package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.SafetyIncidentDTO;
import com.hospital.service.SafetyIncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/safety-incidents")
@CrossOrigin(origins = "*")
public class SafetyIncidentController {

    private final SafetyIncidentService incidentService;

    public SafetyIncidentController(SafetyIncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SafetyIncidentDTO>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getAllIncidents()));
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<ApiResponse<List<SafetyIncidentDTO>>> getReporterIncidents(@PathVariable Long reporterId) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getReporterIncidents(reporterId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SafetyIncidentDTO>> createIncident(@RequestBody SafetyIncidentDTO request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.success(incidentService.createIncident(request), "Safety incident reported"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<SafetyIncidentDTO>> updateIncident(
            @PathVariable Long id,
            @RequestBody SafetyIncidentDTO request) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.updateIncident(id, request), "Safety incident updated"));
    }
}
