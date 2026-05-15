package com.hospital.service;

import com.hospital.dto.ClinicalHandoffDTO;
import com.hospital.model.ClinicalHandoff;
import com.hospital.model.User;
import com.hospital.repository.mysql.ClinicalHandoffRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ClinicalHandoffService {

    private final ClinicalHandoffRepository handoffRepository;
    private final UserRepository userRepository;

    public ClinicalHandoffService(ClinicalHandoffRepository handoffRepository, UserRepository userRepository) {
        this.handoffRepository = handoffRepository;
        this.userRepository = userRepository;
    }

    public List<ClinicalHandoffDTO> getAll() {
        return handoffRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<ClinicalHandoffDTO> getByCreator(Long creatorId) {
        return handoffRepository.findByCreatedBy_IdOrderByUpdatedAtDesc(creatorId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "open", handoffRepository.countByStatus("OPEN"),
                "inProgress", handoffRepository.countByStatus("IN_PROGRESS"),
                "closed", handoffRepository.countByStatus("CLOSED"),
                "high", handoffRepository.countByPriority("HIGH"),
                "critical", handoffRepository.countByPriority("CRITICAL")
        );
    }

    @Transactional
    public ClinicalHandoffDTO create(ClinicalHandoffDTO request) {
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));
        ClinicalHandoff handoff = new ClinicalHandoff();
        handoff.setCreatedBy(creator);
        handoff.setPatientName(clean(request.getPatientName(), "Patient"));
        handoff.setLocation(clean(request.getLocation(), ""));
        handoff.setPriority(normalize(request.getPriority(), "MEDIUM"));
        handoff.setStatus("OPEN");
        handoff.setSummary(clean(request.getSummary(), "No summary provided"));
        handoff.setNextAction(clean(request.getNextAction(), ""));
        handoff.setWatchFlags(clean(request.getWatchFlags(), ""));
        return toDto(handoffRepository.save(handoff));
    }

    @Transactional
    public ClinicalHandoffDTO update(Long id, ClinicalHandoffDTO request) {
        ClinicalHandoff handoff = handoffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clinical handoff not found"));
        handoff.setPriority(normalize(request.getPriority(), handoff.getPriority()));
        handoff.setStatus(normalize(request.getStatus(), handoff.getStatus()));
        handoff.setNextAction(clean(request.getNextAction(), ""));
        handoff.setWatchFlags(clean(request.getWatchFlags(), ""));
        return toDto(handoff);
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private ClinicalHandoffDTO toDto(ClinicalHandoff handoff) {
        ClinicalHandoffDTO dto = new ClinicalHandoffDTO();
        dto.setId(handoff.getId());
        dto.setCreatedById(handoff.getCreatedBy().getId());
        dto.setCreatedByName(handoff.getCreatedBy().getFullName() != null ? handoff.getCreatedBy().getFullName() : handoff.getCreatedBy().getUsername());
        dto.setPatientName(handoff.getPatientName());
        dto.setLocation(handoff.getLocation());
        dto.setPriority(handoff.getPriority());
        dto.setStatus(handoff.getStatus());
        dto.setSummary(handoff.getSummary());
        dto.setNextAction(handoff.getNextAction());
        dto.setWatchFlags(handoff.getWatchFlags());
        dto.setCreatedAt(handoff.getCreatedAt());
        dto.setUpdatedAt(handoff.getUpdatedAt());
        return dto;
    }
}
