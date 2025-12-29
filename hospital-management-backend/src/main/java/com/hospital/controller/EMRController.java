package com.hospital.controller;

import com.hospital.model.*;
import com.hospital.repository.mysql.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emr")
@CrossOrigin(origins = "*")
public class EMRController {

    private final VitalSignsRepository vitalSignsRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    public EMRController(VitalSignsRepository vitalSignsRepository,
            AllergyRepository allergyRepository,
            PrescriptionRepository prescriptionRepository,
            MedicalRecordRepository medicalRecordRepository,
            PatientRepository patientRepository) {
        this.vitalSignsRepository = vitalSignsRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
    }

    // ========== Patient Complete EMR ==========
    @GetMapping("/patient/{patientId}/complete")
    public ResponseEntity<?> getCompleteEMR(@PathVariable Long patientId) {
        try {
            Map<String, Object> emr = new HashMap<>();

            // Patient basic info
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            emr.put("patient", patient);

            // Medical history
            List<MedicalRecord> medicalHistory = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
            emr.put("medicalHistory", medicalHistory);

            // Vital signs (latest 10)
            List<VitalSigns> vitalSigns = vitalSignsRepository.findTop10ByPatientIdOrderByRecordedAtDesc(patientId);
            emr.put("vitalSigns", vitalSigns);

            // Active allergies
            List<Allergy> allergies = allergyRepository.findByPatientIdAndIsActiveTrue(patientId);
            emr.put("allergies", allergies);

            // Active prescriptions
            List<Prescription> activePrescriptions = prescriptionRepository.findByPatientIdAndStatus(patientId,
                    "ACTIVE");
            emr.put("activePrescriptions", activePrescriptions);

            return ResponseEntity.ok(emr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== Vital Signs ==========
    @GetMapping("/patient/{patientId}/vitals")
    public ResponseEntity<?> getVitalSigns(@PathVariable Long patientId) {
        try {
            List<VitalSigns> vitals = vitalSignsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
            return ResponseEntity.ok(vitals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/patient/{patientId}/vitals")
    public ResponseEntity<?> addVitalSigns(@PathVariable Long patientId, @RequestBody VitalSigns vitalSigns) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            vitalSigns.setPatient(patient);
            VitalSigns saved = vitalSignsRepository.save(vitalSigns);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== Allergies ==========
    @GetMapping("/patient/{patientId}/allergies")
    public ResponseEntity<?> getAllergies(@PathVariable Long patientId) {
        try {
            List<Allergy> allergies = allergyRepository.findByPatientId(patientId);
            return ResponseEntity.ok(allergies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/patient/{patientId}/allergies")
    public ResponseEntity<?> addAllergy(@PathVariable Long patientId, @RequestBody Allergy allergy) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            allergy.setPatient(patient);
            Allergy saved = allergyRepository.save(allergy);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== Medical History ==========
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<?> getMedicalHistory(@PathVariable Long patientId) {
        try {
            List<MedicalRecord> history = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== Prescriptions ==========
    @GetMapping("/patient/{patientId}/prescriptions")
    public ResponseEntity<?> getPatientPrescriptions(@PathVariable Long patientId) {
        try {
            List<Prescription> prescriptions = prescriptionRepository
                    .findByPatientIdOrderByPrescriptionDateDesc(patientId);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}/prescriptions")
    public ResponseEntity<?> getDoctorPrescriptions(@PathVariable Long doctorId) {
        try {
            List<Prescription> prescriptions = prescriptionRepository
                    .findByDoctorIdOrderByPrescriptionDateDesc(doctorId);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<?> createPrescription(@RequestBody Prescription prescription) {
        try {
            Prescription saved = prescriptionRepository.save(prescription);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<?> getPrescription(@PathVariable Long id) {
        try {
            Prescription prescription = prescriptionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Prescription not found"));
            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
