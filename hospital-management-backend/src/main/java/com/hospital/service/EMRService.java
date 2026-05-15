package com.hospital.service;

import com.hospital.model.*;
import com.hospital.repository.mysql.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EMRService {

    private final VitalSignsRepository vitalSignsRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    public EMRService(VitalSignsRepository vitalSignsRepository,
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

    @Transactional(readOnly = true)
    public Map<String, Object> getCompleteEMR(Long patientId) {
        Map<String, Object> emr = new HashMap<>();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
        emr.put("patient", patient);

        List<MedicalRecord> medicalHistory = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        emr.put("medicalHistory", medicalHistory);

        List<VitalSigns> vitalSigns = vitalSignsRepository.findTop10ByPatientIdOrderByRecordedAtDesc(patientId);
        emr.put("vitalSigns", vitalSigns);

        List<Allergy> allergies = allergyRepository.findByPatientIdAndIsActiveTrue(patientId);
        emr.put("allergies", allergies);

        List<Prescription> activePrescriptions = prescriptionRepository.findByPatientIdAndStatus(patientId, "ACTIVE");
        emr.put("activePrescriptions", activePrescriptions);

        return emr;
    }

    @Transactional(readOnly = true)
    public List<VitalSigns> getVitalSigns(Long patientId) {
        return vitalSignsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional
    public VitalSigns addVitalSigns(Long patientId, VitalSigns vitalSigns) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
        vitalSigns.setPatient(patient);
        if (vitalSigns.getWeight() != null && vitalSigns.getHeight() != null
                && vitalSigns.getHeight().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal heightMeters = vitalSigns.getHeight().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal bmi = vitalSigns.getWeight().divide(heightMeters.multiply(heightMeters), 2, RoundingMode.HALF_UP);
            vitalSigns.setBmi(bmi);
        }
        return vitalSignsRepository.save(vitalSigns);
    }

    @Transactional(readOnly = true)
    public List<Allergy> getAllergies(Long patientId) {
        return allergyRepository.findByPatientId(patientId);
    }

    @Transactional
    public Allergy addAllergy(Long patientId, Allergy allergy) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
        allergy.setPatient(patient);
        allergy.setIsActive(true);
        return allergyRepository.save(allergy);
    }

    @Transactional
    public Allergy updateAllergyStatus(Long allergyId, boolean isActive) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new RuntimeException("Allergy not found with ID: " + allergyId));
        allergy.setIsActive(isActive);
        return allergyRepository.save(allergy);
    }
}
