package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Doctor;
import com.hospital.service.DoctorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/doctors", "/api/v1/doctors"})
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<Doctor>>> getAllDoctors(
            @PageableDefault(size = 10, sort = "fullName") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllActiveDoctors(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorByUserId(@PathVariable Long userId) {
        // Since Doctor extends User with Joined inheritance, Doctor ID = User ID
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(userId)));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctorsBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialization(specialization)));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkDoctorExists(@PathVariable Long id) {
        doctorService.getDoctorById(id);
        return ResponseEntity.ok().build();
    }
}
