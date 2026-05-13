package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.User;
import com.hospital.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping({"/api/users", "/api/v1/users"})
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfilePicture(
            @PathVariable Long id, 
            @RequestParam("file") MultipartFile file) {
        String fileUrl = userService.updateProfilePicture(id, file);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("profilePictureUrl", fileUrl), 
            "Profile picture updated successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        User updated = userService.updateUser(id, updates);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @PatchMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }


    @RequestMapping(value = "/check", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkAvailability(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        boolean exists = false;
        if (username != null) exists = userService.existsByUsername(username);
        if (email != null) exists = exists || userService.existsByEmail(email);
        
        return exists ? ResponseEntity.status(HttpStatus.CONFLICT).build() : ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkUserExists(@PathVariable Long id) {
        userService.getUserById(id);
        return ResponseEntity.ok().build();
    }
}
