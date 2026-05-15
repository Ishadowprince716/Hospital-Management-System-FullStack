package com.hospital.service;

import com.hospital.dto.InsurancePreauthorizationDTO;
import com.hospital.model.InsurancePreauthorization;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.InsurancePreauthorizationRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class InsurancePreauthorizationService {

    private final InsurancePreauthorizationRepository preauthRepository;
    private final PatientRepository patientRepository;

    public InsurancePreauthorizationService(InsurancePreauthorizationRepository preauthRepository,
                                            PatientRepository patientRepository) {
        this.preauthRepository = preauthRepository;
        this.patientRepository = patientRepository;
    }

    public List<InsurancePreauthorizationDTO> getAll() {
        return preauthRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<InsurancePreauthorizationDTO> getByPatient(Long patientId) {
        return preauthRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "submitted", preauthRepository.countByStatus("SUBMITTED"),
                "inReview", preauthRepository.countByStatus("IN_REVIEW"),
                "approved", preauthRepository.countByStatus("APPROVED"),
                "denied", preauthRepository.countByStatus("DENIED"),
                "urgent", preauthRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public InsurancePreauthorizationDTO create(InsurancePreauthorizationDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        InsurancePreauthorization preauth = new InsurancePreauthorization();
        preauth.setPatient(patient);
        applyPatientFields(preauth, request);
        preauth.setStatus(normalize(request.getStatus(), "SUBMITTED"));
        return toDto(preauthRepository.save(preauth));
    }

    @Transactional
    public InsurancePreauthorizationDTO update(Long id, InsurancePreauthorizationDTO request) {
        InsurancePreauthorization preauth = preauthRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Preauthorization not found"));
        preauth.setStatus(normalize(request.getStatus(), preauth.getStatus()));
        preauth.setPriority(normalize(request.getPriority(), preauth.getPriority()));
        preauth.setAdminNote(clean(request.getAdminNote(), ""));
        preauth.setRequiredDocuments(clean(request.getRequiredDocuments(), ""));
        return toDto(preauth);
    }

    private void applyPatientFields(InsurancePreauthorization preauth, InsurancePreauthorizationDTO request) {
        preauth.setInsuranceProvider(clean(request.getInsuranceProvider(), "Insurance Provider"));
        preauth.setPolicyNumber(clean(request.getPolicyNumber(), ""));
        preauth.setTreatment(clean(request.getTreatment(), "Treatment"));
        preauth.setEstimatedAmount(request.getEstimatedAmount());
        preauth.setPriority(normalize(request.getPriority(), "NORMAL"));
        preauth.setNotes(clean(request.getNotes(), ""));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private InsurancePreauthorizationDTO toDto(InsurancePreauthorization preauth) {
        InsurancePreauthorizationDTO dto = new InsurancePreauthorizationDTO();
        dto.setId(preauth.getId());
        dto.setPatientId(preauth.getPatient().getId());
        dto.setPatientName(preauth.getPatient().getFullName() != null ? preauth.getPatient().getFullName() : preauth.getPatient().getUsername());
        dto.setInsuranceProvider(preauth.getInsuranceProvider());
        dto.setPolicyNumber(preauth.getPolicyNumber());
        dto.setTreatment(preauth.getTreatment());
        dto.setEstimatedAmount(preauth.getEstimatedAmount());
        dto.setStatus(preauth.getStatus());
        dto.setPriority(preauth.getPriority());
        dto.setNotes(preauth.getNotes());
        dto.setAdminNote(preauth.getAdminNote());
        dto.setRequiredDocuments(preauth.getRequiredDocuments());
        dto.setCreatedAt(preauth.getCreatedAt());
        dto.setUpdatedAt(preauth.getUpdatedAt());
        return dto;
    }
}
