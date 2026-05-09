package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.LabOrder;
import com.hospital.service.LabOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lab-orders")
@CrossOrigin(origins = "*")
public class LabOrderController {

    private final LabOrderService labOrderService;

    public LabOrderController(LabOrderService labOrderService) {
        this.labOrderService = labOrderService;
    }

    // Get all lab orders for a doctor with pagination
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<Page<LabOrder>>> getDoctorLabOrders(
            @PathVariable Long doctorId,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(labOrderService.getDoctorLabOrders(doctorId, pageable)));
    }

    // Get all lab orders for a patient with pagination
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<LabOrder>>> getPatientLabOrders(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(labOrderService.getPatientLabOrders(patientId, pageable)));
    }

    // Get all lab orders with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<LabOrder>>> getAllLabOrders(
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(labOrderService.getAllLabOrders(pageable)));
    }

    // Create new lab order
    @PostMapping
    public ResponseEntity<ApiResponse<LabOrder>> createLabOrder(@Valid @RequestBody LabOrder labOrder) {
        LabOrder saved = labOrderService.createLabOrder(labOrder);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Lab order created successfully"));
    }

    // Update lab order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LabOrder>> updateLabOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        LabOrder updated = labOrderService.updateLabOrderStatus(id, statusUpdate.get("status"));
        return ResponseEntity.ok(ApiResponse.success(updated, "Lab order status updated successfully"));
    }

    // Get a specific lab order by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LabOrder>> getLabOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(labOrderService.getLabOrderById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLabOrder(@PathVariable Long id) {
        labOrderService.deleteLabOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Lab order deleted successfully"));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkLabOrderExists(@PathVariable Long id) {
        labOrderService.getLabOrderById(id);
        return ResponseEntity.ok().build();
    }
}
