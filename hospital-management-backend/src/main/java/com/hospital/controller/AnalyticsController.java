package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.AnalyticsDashboardDTO;
import com.hospital.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsDashboardDTO>> getDashboardStats() {
        AnalyticsDashboardDTO stats = analyticsService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
