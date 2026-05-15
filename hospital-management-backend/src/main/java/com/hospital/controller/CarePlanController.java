package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.CarePlanTaskDTO;
import com.hospital.service.CarePlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/care-plan")
@CrossOrigin(origins = "*")
public class CarePlanController {

    private final CarePlanService carePlanService;

    public CarePlanController(CarePlanService carePlanService) {
        this.carePlanService = carePlanService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<CarePlanTaskDTO>>> getPatientTasks(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(carePlanService.getPatientTasks(patientId)));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<CarePlanTaskDTO>> createTask(
            @PathVariable Long patientId,
            @RequestBody CarePlanTaskDTO request) {
        return ResponseEntity.ok(ApiResponse.success(carePlanService.createTask(patientId, request), "Care task created"));
    }

    @PatchMapping("/tasks/{taskId}/toggle")
    public ResponseEntity<ApiResponse<CarePlanTaskDTO>> toggleTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(carePlanService.toggleTask(taskId), "Care task updated"));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        carePlanService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(null, "Care task deleted"));
    }
}
