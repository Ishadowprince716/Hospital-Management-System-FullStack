package com.hospital.service;

import com.hospital.dto.SafetyIncidentDTO;
import com.hospital.model.SafetyIncident;
import com.hospital.model.User;
import com.hospital.repository.mysql.SafetyIncidentRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class SafetyIncidentService {

    private final SafetyIncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public SafetyIncidentService(SafetyIncidentRepository incidentRepository, UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public List<SafetyIncidentDTO> getAllIncidents() {
        return incidentRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<SafetyIncidentDTO> getReporterIncidents(Long reporterId) {
        return incidentRepository.findByReportedBy_IdOrderByUpdatedAtDesc(reporterId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "open", incidentRepository.countByStatus("OPEN"),
                "reviewing", incidentRepository.countByStatus("REVIEWING"),
                "resolved", incidentRepository.countByStatus("RESOLVED"),
                "critical", incidentRepository.countBySeverity("CRITICAL"),
                "high", incidentRepository.countBySeverity("HIGH")
        );
    }

    @Transactional
    public SafetyIncidentDTO createIncident(SafetyIncidentDTO request) {
        User reporter = userRepository.findById(request.getReportedById())
                .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));

        SafetyIncident incident = new SafetyIncident();
        incident.setReportedBy(reporter);
        incident.setTitle(clean(request.getTitle(), "Safety incident"));
        incident.setCategory(clean(request.getCategory(), "Clinical"));
        incident.setSeverity(normalize(request.getSeverity(), "MEDIUM"));
        incident.setStatus("OPEN");
        incident.setDescription(clean(request.getDescription(), "No details provided"));
        incident.setPatientIdentifier(clean(request.getPatientIdentifier(), ""));
        incident.setLocation(clean(request.getLocation(), ""));
        return toDto(incidentRepository.save(incident));
    }

    @Transactional
    public SafetyIncidentDTO updateIncident(Long id, SafetyIncidentDTO request) {
        SafetyIncident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Safety incident not found"));
        incident.setStatus(normalize(request.getStatus(), incident.getStatus()));
        incident.setSeverity(normalize(request.getSeverity(), incident.getSeverity()));
        incident.setCorrectiveAction(request.getCorrectiveAction());
        return toDto(incident);
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private SafetyIncidentDTO toDto(SafetyIncident incident) {
        SafetyIncidentDTO dto = new SafetyIncidentDTO();
        dto.setId(incident.getId());
        dto.setReportedById(incident.getReportedBy().getId());
        dto.setReporterName(incident.getReportedBy().getFullName() != null
                ? incident.getReportedBy().getFullName()
                : incident.getReportedBy().getUsername());
        dto.setTitle(incident.getTitle());
        dto.setCategory(incident.getCategory());
        dto.setSeverity(incident.getSeverity());
        dto.setStatus(incident.getStatus());
        dto.setDescription(incident.getDescription());
        dto.setPatientIdentifier(incident.getPatientIdentifier());
        dto.setLocation(incident.getLocation());
        dto.setCorrectiveAction(incident.getCorrectiveAction());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        return dto;
    }
}
