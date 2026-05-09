package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.config.JwtUtil;
import com.hospital.dto.AppointmentDTO;
import com.hospital.dto.PaginatedResponse;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.model.Appointment;
import com.hospital.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping({"/api/appointments", "/api/v1/appointments"})
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentMapper appointmentMapper;
    private final JwtUtil jwtUtil;

    public AppointmentController(AppointmentService appointmentService, AppointmentMapper appointmentMapper, JwtUtil jwtUtil) {
        this.appointmentService = appointmentService;
        this.appointmentMapper = appointmentMapper;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<AppointmentDTO>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        Appointment appointment = appointmentService.bookAppointment(
                request.patientId(),
                request.doctorId(),
                request.date(),
                request.time(),
                request.reason(),
                request.type());
        return ResponseEntity.status(201).body(ApiResponse.success(appointmentMapper.toDTO(appointment), "Appointment booked successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentMapper.toDTO(appointmentService.getAppointmentById(id))));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getPatientAppointments(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "appointmentDate") Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getPatientAppointments(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.fromPage(appointments.map(appointmentMapper::toDTO))));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @PageableDefault(size = 10, sort = "appointmentDate") Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getDoctorAppointments(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.fromPage(appointments.map(appointmentMapper::toDTO))));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(appointmentMapper.toDTO(appointment), "Appointment cancelled successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {
        if (status == null && body != null) {
            status = body.get("status");
        }
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required");
        }
        Appointment appointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(appointmentMapper.toDTO(appointment), "Appointment status updated successfully"));
    }

    @GetMapping({"", "/all"})
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getAllAppointments(
            @PageableDefault(size = 10, sort = "appointmentDate") Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.fromPage(appointments.map(appointmentMapper::toDTO))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Appointment deleted successfully"));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkAppointmentExists(@PathVariable Long id) {
        appointmentService.getAppointmentById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Get appointments for the currently authenticated user (patient or doctor)
     * Extracts user ID from the JWT token automatically
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getMyAppointments(
            HttpServletRequest request,
            @PageableDefault(size = 10, sort = "appointmentDate") Pageable pageable) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(ApiResponse.success(new PaginatedResponse<>(Collections.emptyList(), 0, 10, 0, 0, true)));
        }
        String token = authHeader.substring(7);
        Long userId;
        String role;
        try {
            userId = ((Number) jwtUtil.extractClaim(token, claims -> claims.get("userId"))).longValue();
            role   = (String) jwtUtil.extractClaim(token, claims -> claims.get("role"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(new PaginatedResponse<>(Collections.emptyList(), 0, 10, 0, 0, true)));
        }
        
        Page<Appointment> appointments;
        if ("ADMIN".equalsIgnoreCase(role)) {
            appointments = appointmentService.getAllAppointments(pageable);
        } else if ("DOCTOR".equalsIgnoreCase(role)) {
            appointments = appointmentService.getDoctorAppointments(userId, pageable);
        } else {
            appointments = appointmentService.getPatientAppointments(userId, pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.fromPage(appointments.map(appointmentMapper::toDTO))));
    }

    /**
     * Get appointments for the currently authenticated doctor
     */
    @GetMapping("/doctor")
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getDoctorMyAppointments(
            HttpServletRequest request,
            @PageableDefault(size = 10, sort = "appointmentDate") Pageable pageable) {
        return getMyAppointments(request, pageable);
    }

    // DTOs
    public record AppointmentRequest(
            @NotNull(message = "Patient ID is required") Long patientId,
            @NotNull(message = "Doctor ID is required") Long doctorId,
            @NotNull(message = "Date is required") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @NotNull(message = "Time is required") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            String reason,
            String type) {
    }
}
