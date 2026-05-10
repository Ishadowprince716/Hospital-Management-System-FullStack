package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.TelehealthSession;
import com.hospital.service.TelehealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telehealth")
public class TelehealthController {

    private final TelehealthService telehealthService;

    public TelehealthController(TelehealthService telehealthService) {
        this.telehealthService = telehealthService;
    }

    @GetMapping("/session/{appointmentId}")
    public ResponseEntity<ApiResponse<TelehealthSession>> getSession(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(telehealthService.getOrCreateSession(appointmentId)));
    }

    @PostMapping("/session/{appointmentId}/end")
    public ResponseEntity<ApiResponse<String>> endSession(@PathVariable Long appointmentId) {
        telehealthService.endSession(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Session ended"));
    }
}
