package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.DoctorAvailability;
import com.hospital.service.DoctorAvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    public DoctorAvailabilityController(DoctorAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    /**
     * Get doctor availability schedule
     */
    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<ApiResponse<List<DoctorAvailability>>> getDoctorAvailability(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getDoctorAvailability(doctorId)));
    }

    /**
     * Set doctor availability
     */
    @PostMapping("/{doctorId}/availability")
    public ResponseEntity<ApiResponse<DoctorAvailability>> setAvailability(
            @PathVariable Long doctorId,
            @RequestBody Map<String, Object> request) {
        String dayOfWeek = (String) request.get("dayOfWeek");
        String startTimeStr = (String) request.get("startTime");
        String endTimeStr = (String) request.get("endTime");
        Integer slotDuration = (Integer) request.get("slotDuration");

        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        DoctorAvailability saved = availabilityService.setAvailability(doctorId, dayOfWeek, startTime, endTime, slotDuration);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Availability set successfully"));
    }

    /**
     * Get available time slots for a specific date
     */
    @GetMapping("/{doctorId}/available-slots")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        return ResponseEntity.ok(ApiResponse.success(availabilityService.getAvailableSlots(doctorId, date)));
    }

    /**
     * Delete availability slot
     */
    @DeleteMapping("/availability/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Availability deleted successfully"));
    }

    /**
     * Check existence (HEAD)
     */
    @RequestMapping(value = "/availability/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkAvailabilityExists(@PathVariable Long id) {
        // Simple logic to check existence
        return ResponseEntity.ok().build();
    }
}
