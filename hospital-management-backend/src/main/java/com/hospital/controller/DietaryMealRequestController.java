package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.DietaryMealRequestDTO;
import com.hospital.service.DietaryMealRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dietary-meals")
@CrossOrigin(origins = "*")
public class DietaryMealRequestController {

    private final DietaryMealRequestService mealService;

    public DietaryMealRequestController(DietaryMealRequestService mealService) {
        this.mealService = mealService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DietaryMealRequestDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(mealService.getAll()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<DietaryMealRequestDTO>>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(mealService.getByPatient(patientId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(mealService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DietaryMealRequestDTO>> create(@RequestBody DietaryMealRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success(mealService.create(request), "Dietary meal request submitted"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<DietaryMealRequestDTO>> update(@PathVariable Long id, @RequestBody DietaryMealRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(mealService.update(id, request), "Dietary meal request updated"));
    }
}
