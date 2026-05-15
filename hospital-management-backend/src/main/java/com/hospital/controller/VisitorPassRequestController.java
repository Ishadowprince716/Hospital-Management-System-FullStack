package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.VisitorPassRequestDTO;
import com.hospital.service.VisitorPassRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor-passes")
@CrossOrigin(origins = "*")
public class VisitorPassRequestController {

    private final VisitorPassRequestService visitorService;

    public VisitorPassRequestController(VisitorPassRequestService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VisitorPassRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(visitorService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<VisitorPassRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(visitorService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VisitorPassRequestDTO>> create(@RequestBody VisitorPassRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(visitorService.create(request), "Visitor pass requested"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<VisitorPassRequestDTO>> update(@PathVariable Long id, @RequestBody VisitorPassRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.update(id, request), "Visitor pass updated"));
    }
}
