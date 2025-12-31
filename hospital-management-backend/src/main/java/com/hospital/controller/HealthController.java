package com.hospital.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("status", "ok"));
    }

    @GetMapping("/ready")
    public ResponseEntity<?> ready() {
        // TODO: add DB connectivity check if needed
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("ready", true));
    }
}
