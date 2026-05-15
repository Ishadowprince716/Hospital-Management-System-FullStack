package com.hospital.service;

import com.hospital.dto.DischargePlanDTO;
import com.hospital.model.DischargePlan;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.DischargePlanRepository;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class DischargePlanService {

    private final DischargePlanRepository dischargePlanRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public DischargePlanService(DischargePlanRepository dischargePlanRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository) {
        this.dischargePlanRepository = dischargePlanRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DischargePlanDTO> getAll() {
        return dischargePlanRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<DischargePlanDTO> getByPatient(Long patientId) {
        return dischargePlanRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public List<DischargePlanDTO> getByDoctor(Long doctorId) {
        return dischargePlanRepository.findByDoctor_IdOrderByUpdatedAtDesc(doctorId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "draft", dischargePlanRepository.countByStatus("DRAFT"),
                "ready", dischargePlanRepository.countByStatus("READY"),
                "completed", dischargePlanRepository.countByStatus("COMPLETED"),
                "billingBlocked", dischargePlanRepository.countByBillingClearedFalse()
        );
    }

    @Transactional
    public DischargePlanDTO create(DischargePlanDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        DischargePlan plan = new DischargePlan();
        plan.setPatient(patient);
        plan.setDoctor(doctor);
        apply(plan, request);
        plan.setStatus(normalize(request.getStatus(), "DRAFT"));
        return toDto(dischargePlanRepository.save(plan));
    }

    @Transactional
    public DischargePlanDTO update(Long id, DischargePlanDTO request) {
        DischargePlan plan = dischargePlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discharge plan not found"));
        apply(plan, request);
        plan.setStatus(normalize(request.getStatus(), plan.getStatus()));
        return toDto(plan);
    }

    private void apply(DischargePlan plan, DischargePlanDTO request) {
        plan.setPlannedDischargeDate(request.getPlannedDischargeDate());
        plan.setDiagnosis(clean(request.getDiagnosis(), ""));
        plan.setMedicationInstructions(clean(request.getMedicationInstructions(), ""));
        plan.setCareInstructions(clean(request.getCareInstructions(), ""));
        plan.setFollowUpPlan(clean(request.getFollowUpPlan(), ""));
        plan.setRedFlags(clean(request.getRedFlags(), ""));
        plan.setTransportRequired(request.isTransportRequired());
        plan.setBillingCleared(request.isBillingCleared());
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private DischargePlanDTO toDto(DischargePlan plan) {
        DischargePlanDTO dto = new DischargePlanDTO();
        dto.setId(plan.getId());
        dto.setPatientId(plan.getPatient().getId());
        dto.setPatientName(plan.getPatient().getFullName() != null ? plan.getPatient().getFullName() : plan.getPatient().getUsername());
        dto.setDoctorId(plan.getDoctor().getId());
        dto.setDoctorName(plan.getDoctor().getFullName());
        dto.setStatus(plan.getStatus());
        dto.setPlannedDischargeDate(plan.getPlannedDischargeDate());
        dto.setDiagnosis(plan.getDiagnosis());
        dto.setMedicationInstructions(plan.getMedicationInstructions());
        dto.setCareInstructions(plan.getCareInstructions());
        dto.setFollowUpPlan(plan.getFollowUpPlan());
        dto.setRedFlags(plan.getRedFlags());
        dto.setTransportRequired(plan.isTransportRequired());
        dto.setBillingCleared(plan.isBillingCleared());
        dto.setCreatedAt(plan.getCreatedAt());
        dto.setUpdatedAt(plan.getUpdatedAt());
        return dto;
    }
}
