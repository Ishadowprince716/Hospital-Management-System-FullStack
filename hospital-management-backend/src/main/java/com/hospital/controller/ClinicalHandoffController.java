package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.ClinicalHandoffDTO;
import com.hospital.service.ClinicalHandoffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clinical-handoffs")
@CrossOrigin(origins = "*")
public class ClinicalHandoffController {

    private final ClinicalHandoffService handoffService;

    public ClinicalHandoffController(ClinicalHandoffService handoffService) {
        this.handoffService = handoffService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClinicalHandoffDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(handoffService.getAll()));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<ApiResponse<List<ClinicalHandoffDTO>>> getByCreator(@PathVariable Long creatorId) {
        return ResponseEntity.ok(ApiResponse.success(handoffService.getByCreator(creatorId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(handoffService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClinicalHandoffDTO>> create(@RequestBody ClinicalHandoffDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(handoffService.create(request), "Clinical handoff created"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ClinicalHandoffDTO>> update(@PathVariable Long id, @RequestBody ClinicalHandoffDTO request) {
        return ResponseEntity.ok(ApiResponse.success(handoffService.update(id, request), "Clinical handoff updated"));
    }
}
