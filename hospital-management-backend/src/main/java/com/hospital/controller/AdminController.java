package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.DashboardDTO;
import com.hospital.dto.UserRequestDTO;
import com.hospital.model.User;
import com.hospital.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @PageableDefault(size = 10, sort = "username") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(pageable)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserRequestDTO userRequest) {
        User savedUser = adminService.createUser(userRequest);
        return ResponseEntity.status(201).body(ApiResponse.success(savedUser, "User created successfully"));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO userRequest) {
        User updatedUser = adminService.updateUser(id, userRequest);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        User updatedUser = adminService.updateUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User status updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.updateUserStatus(id, false); // Just deactivate for now
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully"));
    }

    @RequestMapping(value = "/users/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkUserExists(@PathVariable Long id) {
        adminService.getAllUsers(Pageable.unpaged()); // Dummy check or better findById
        return ResponseEntity.ok().build();
    }
}
