package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Patient;
import com.hospital.service.PatientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // Get all patients list with pagination
    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<Patient>>> getAllPatients(
            @PageableDefault(size = 10, sort = "fullName") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getAllPatients(pageable)));
    }

    // Get patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    // Search patients by name with pagination
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Patient>>> searchPatients(
            @RequestParam String query,
            @PageableDefault(size = 10, sort = "fullName") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(patientService.searchPatients(query, pageable)));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkPatientExists(@PathVariable Long id) {
        patientService.getPatientById(id);
        return ResponseEntity.ok().build();
    }
}
