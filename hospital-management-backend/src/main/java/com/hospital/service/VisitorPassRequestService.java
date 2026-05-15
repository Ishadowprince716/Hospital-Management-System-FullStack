package com.hospital.service;

import com.hospital.dto.VisitorPassRequestDTO;
import com.hospital.model.Patient;
import com.hospital.model.VisitorPassRequest;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.VisitorPassRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class VisitorPassRequestService {

    private final VisitorPassRequestRepository visitorRepository;
    private final PatientRepository patientRepository;

    public VisitorPassRequestService(VisitorPassRequestRepository visitorRepository,
                                     PatientRepository patientRepository) {
        this.visitorRepository = visitorRepository;
        this.patientRepository = patientRepository;
    }

    public List<VisitorPassRequestDTO> getAll() {
        return visitorRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<VisitorPassRequestDTO> getByPatient(Long patientId) {
        return visitorRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", visitorRepository.countByStatus("REQUESTED"),
                "approved", visitorRepository.countByStatus("APPROVED"),
                "checkedIn", visitorRepository.countByStatus("CHECKED_IN"),
                "restricted", visitorRepository.countByRiskLevel("RESTRICTED")
        );
    }

    @Transactional
    public VisitorPassRequestDTO create(VisitorPassRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        VisitorPassRequest visitor = new VisitorPassRequest();
        visitor.setPatient(patient);
        apply(visitor, request);
        visitor.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(visitorRepository.save(visitor));
    }

    @Transactional
    public VisitorPassRequestDTO update(Long id, VisitorPassRequestDTO request) {
        VisitorPassRequest visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visitor pass request not found"));
        if (request.getVisitorName() != null) {
            apply(visitor, request);
        }
        String status = normalize(request.getStatus(), visitor.getStatus());
        visitor.setStatus(status);
        visitor.setRiskLevel(normalize(request.getRiskLevel(), visitor.getRiskLevel()));
        visitor.setFrontDeskNote(clean(request.getFrontDeskNote(), ""));
        if ("APPROVED".equals(status) && (visitor.getPassCode() == null || visitor.getPassCode().isBlank())) {
            visitor.setPassCode("VP-" + visitor.getId() + "-" + LocalDate.now().getYear());
        }
        if ("CHECKED_IN".equals(status) && visitor.getCheckedInAt() == null) {
            visitor.setCheckedInAt(LocalDateTime.now());
        }
        if ("CHECKED_OUT".equals(status) && visitor.getCheckedOutAt() == null) {
            visitor.setCheckedOutAt(LocalDateTime.now());
        }
        return toDto(visitor);
    }

    private void apply(VisitorPassRequest visitor, VisitorPassRequestDTO request) {
        visitor.setVisitorName(clean(request.getVisitorName(), "Visitor"));
        visitor.setVisitorPhone(clean(request.getVisitorPhone(), "Not provided"));
        visitor.setRelationship(clean(request.getRelationship(), ""));
        visitor.setVisitDate(request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now());
        visitor.setTimeWindow(clean(request.getTimeWindow(), "ANYTIME"));
        visitor.setPurpose(clean(request.getPurpose(), ""));
        visitor.setRiskLevel(normalize(request.getRiskLevel(), "STANDARD"));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private VisitorPassRequestDTO toDto(VisitorPassRequest visitor) {
        VisitorPassRequestDTO dto = new VisitorPassRequestDTO();
        dto.setId(visitor.getId());
        dto.setPatientId(visitor.getPatient().getId());
        dto.setPatientName(visitor.getPatient().getFullName() != null ? visitor.getPatient().getFullName() : visitor.getPatient().getUsername());
        dto.setVisitorName(visitor.getVisitorName());
        dto.setVisitorPhone(visitor.getVisitorPhone());
        dto.setRelationship(visitor.getRelationship());
        dto.setVisitDate(visitor.getVisitDate());
        dto.setTimeWindow(visitor.getTimeWindow());
        dto.setPurpose(visitor.getPurpose());
        dto.setStatus(visitor.getStatus());
        dto.setRiskLevel(visitor.getRiskLevel());
        dto.setPassCode(visitor.getPassCode());
        dto.setCheckedInAt(visitor.getCheckedInAt());
        dto.setCheckedOutAt(visitor.getCheckedOutAt());
        dto.setFrontDeskNote(visitor.getFrontDeskNote());
        dto.setCreatedAt(visitor.getCreatedAt());
        dto.setUpdatedAt(visitor.getUpdatedAt());
        return dto;
    }
}
