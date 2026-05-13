package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.AuthResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.RegisterRequest;
import com.hospital.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<Void>> initializeUsers() {
        authService.initializeDefaultUsers();
        return ResponseEntity.ok(ApiResponse.success(null, "Default users initialized successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@RequestBody OtpRequest request) {
        AuthResponse response = authService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.success(response, "OTP verified successfully"));
    }

    public record OtpRequest(String email, String otp) {
    }
}
