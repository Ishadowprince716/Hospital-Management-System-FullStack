package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.service.ResourceOrchestrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/orchestration")
public class OrchestrationController {

    private final ResourceOrchestrationService resourceOrchestrationService;

    public OrchestrationController(ResourceOrchestrationService resourceOrchestrationService) {
        this.resourceOrchestrationService = resourceOrchestrationService;
    }

    @GetMapping("/demand-forecast")
    public ResponseEntity<ApiResponse<String>> getDemandForecast() {
        return ResponseEntity.ok(ApiResponse.success(resourceOrchestrationService.predictUpcomingDemand()));
    }

    @GetMapping("/capacity-heatmap")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getCapacityHeatmap() {
        return ResponseEntity.ok(ApiResponse.success(resourceOrchestrationService.getLiveCapacityHeatmap()));
    }
}
