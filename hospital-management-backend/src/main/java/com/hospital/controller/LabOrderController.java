package com.hospital.controller;

import com.hospital.model.*;
import com.hospital.repository.mysql.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lab-orders")
@CrossOrigin(origins = "*")
public class LabOrderController {

    private final LabOrderRepository labOrderRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public LabOrderController(LabOrderRepository labOrderRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.labOrderRepository = labOrderRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // Get all lab orders for a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorLabOrders(@PathVariable Long doctorId) {
        try {
            List<LabOrder> orders = labOrderRepository.findByDoctorIdOrderByOrderDateDesc(doctorId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all lab orders for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientLabOrders(@PathVariable Long patientId) {
        try {
            List<LabOrder> orders = labOrderRepository.findByPatientIdOrderByOrderDateDesc(patientId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get pending lab orders for a doctor
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<?> getPendingLabOrders(@PathVariable Long doctorId) {
        try {
            List<LabOrder> orders = labOrderRepository.findByDoctorIdAndStatus(doctorId, "PENDING");
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Create new lab order
    @PostMapping
    public ResponseEntity<?> createLabOrder(@RequestBody LabOrder labOrder) {
        try {
            if (labOrder.getPatient() != null) {
                Long patientId = labOrder.getPatient().getId();
                if (patientId != null) {
                    Patient patient = patientRepository.findById(patientId)
                            .orElseThrow(() -> new RuntimeException("Patient not found"));
                    labOrder.setPatient(patient);
                }
            }

            if (labOrder.getDoctor() != null) {
                Long doctorId = labOrder.getDoctor().getId();
                if (doctorId != null) {
                    Doctor doctor = doctorRepository.findById(doctorId)
                            .orElseThrow(() -> new RuntimeException("Doctor not found"));
                    labOrder.setDoctor(doctor);
                }
            }

            LabOrder saved = labOrderRepository.save(labOrder);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update lab order status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateLabOrderStatus(@PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            if (id == null)
                throw new IllegalArgumentException("ID cannot be null");
            LabOrder order = labOrderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab order not found"));

            order.setStatus(statusUpdate.get("status"));

            if (statusUpdate.containsKey("resultSummary")) {
                order.setResultSummary(statusUpdate.get("resultSummary"));
            }

            LabOrder updated = labOrderRepository.save(order);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get specific lab order
    @GetMapping("/{id}")
    public ResponseEntity<?> getLabOrder(@PathVariable Long id) {
        try {
            LabOrder order = labOrderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lab order not found"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete lab order
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLabOrder(@PathVariable Long id) {
        try {
            if (id == null)
                throw new IllegalArgumentException("ID cannot be null");
            labOrderRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Lab order deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
