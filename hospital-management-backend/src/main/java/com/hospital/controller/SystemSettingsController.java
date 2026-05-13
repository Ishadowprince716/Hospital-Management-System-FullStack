package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.SystemSettingsDTO;
import com.hospital.service.SystemSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    public SystemSettingsController(SystemSettingsService systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SystemSettingsDTO>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingsService.getSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SystemSettingsDTO>> updateSettings(@RequestBody SystemSettingsDTO request) {
        return ResponseEntity.ok(ApiResponse.success(
                systemSettingsService.updateSettings(request),
                "System settings updated successfully"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingsService.getHealthSnapshot()));
    }
}
