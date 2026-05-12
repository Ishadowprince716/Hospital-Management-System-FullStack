package com.hospital.controller;

import com.hospital.common.ApiResponse;
import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/api", "/api/"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> apiRoot() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "name", "MediCare HMS API",
                "status", "ok",
                "database", "configured by SPRING_DATASOURCE_URL",
                "links", Map.of(
                        "health", "/api/health",
                        "readiness", "/ready",
                        "actuatorHealth", "/actuator/health",
                        "doctors", "/api/doctors",
                        "swagger", "/swagger-ui/index.html",
                        "openApi", "/v3/api-docs",
                        "h2Console", "/h2-console/"))));
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok")));
    }

    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ready() {
        // TODO: add DB connectivity check if needed
        return ResponseEntity.ok(ApiResponse.success(Map.of("ready", true)));
    }

    @GetMapping("/h2-console")
    public ResponseEntity<Void> h2ConsoleRedirect() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/h2-console/"))
                .build();
    }
}
