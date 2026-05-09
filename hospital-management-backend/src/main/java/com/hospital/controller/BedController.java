package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Bed;
import com.hospital.model.Ward;
import com.hospital.service.BedManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    private final BedManagementService bedManagementService;

    public BedController(BedManagementService bedManagementService) {
        this.bedManagementService = bedManagementService;
    }

    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<List<Ward>>> getWards() {
        return ResponseEntity.ok(ApiResponse.success(bedManagementService.getAllWards()));
    }

    @PostMapping("/{bedId}/assign")
    public ResponseEntity<ApiResponse<Bed>> assignBed(@PathVariable Long bedId, @RequestParam Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(bedManagementService.assignBed(bedId, patientId)));
    }

    @PostMapping("/{bedId}/release")
    public ResponseEntity<ApiResponse<String>> releaseBed(@PathVariable Long bedId) {
        bedManagementService.releaseBed(bedId);
        return ResponseEntity.ok(ApiResponse.success("Bed released and scheduled for cleaning"));
    }
}
