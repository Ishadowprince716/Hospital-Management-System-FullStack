package com.hospital.service;

import com.hospital.dto.CommandAlertDTO;
import com.hospital.model.CommandAlert;
import com.hospital.repository.mysql.CommandAlertRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommandAlertService {
    private final CommandAlertRepository commandAlertRepository;

    public CommandAlertService(CommandAlertRepository commandAlertRepository) {
        this.commandAlertRepository = commandAlertRepository;
    }

    public List<CommandAlertDTO> list(String status) {
        List<CommandAlert> alerts = status == null || status.isBlank()
                ? commandAlertRepository.findTop50ByOrderByCreatedAtDesc()
                : commandAlertRepository.findByStatusNotOrderByCreatedAtDesc("RESOLVED").stream()
                    .filter(alert -> status.equalsIgnoreCase(alert.getStatus()))
                    .collect(Collectors.toList());
        return alerts.stream().map(this::toDto).toList();
    }

    public CommandAlertDTO create(CommandAlertDTO dto) {
        CommandAlert alert = new CommandAlert();
        apply(alert, dto);
        return toDto(commandAlertRepository.save(alert));
    }

    public CommandAlertDTO updateStatus(Long id, CommandAlertDTO dto) {
        CommandAlert alert = commandAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Command alert not found"));
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            alert.setStatus(normalize(dto.getStatus(), "OPEN"));
            if ("RESOLVED".equals(alert.getStatus())) {
                alert.setResolvedAt(LocalDateTime.now());
            }
        }
        if (dto.getOwnerName() != null) alert.setOwnerName(dto.getOwnerName());
        if (dto.getResolutionNotes() != null) alert.setResolutionNotes(dto.getResolutionNotes());
        return toDto(commandAlertRepository.save(alert));
    }

    public Map<String, Object> metrics() {
        List<CommandAlert> alerts = commandAlertRepository.findTop50ByOrderByCreatedAtDesc();
        long open = alerts.stream().filter(alert -> !"RESOLVED".equals(alert.getStatus())).count();
        long critical = alerts.stream().filter(alert -> "CRITICAL".equals(alert.getSeverity()) && !"RESOLVED".equals(alert.getStatus())).count();
        long breached = alerts.stream().filter(this::isBreached).count();
        Map<String, Long> byDepartment = alerts.stream()
                .filter(alert -> !"RESOLVED".equals(alert.getStatus()))
                .collect(Collectors.groupingBy(CommandAlert::getDepartment, Collectors.counting()));
        return Map.of(
                "openAlerts", open,
                "criticalAlerts", critical,
                "slaBreaches", breached,
                "departments", byDepartment
        );
    }

    private void apply(CommandAlert alert, CommandAlertDTO dto) {
        alert.setTitle(dto.getTitle());
        alert.setDescription(dto.getDescription());
        alert.setDepartment(normalize(dto.getDepartment(), "OPERATIONS"));
        alert.setPatientName(dto.getPatientName());
        alert.setPatientIdentifier(dto.getPatientIdentifier());
        alert.setSeverity(normalize(dto.getSeverity(), "MEDIUM"));
        alert.setStatus(normalize(dto.getStatus(), "OPEN"));
        alert.setOwnerName(dto.getOwnerName());
        alert.setSlaMinutes(dto.getSlaMinutes() == null ? 30 : dto.getSlaMinutes());
        alert.setRecommendedAction(dto.getRecommendedAction());
        alert.setResolutionNotes(dto.getResolutionNotes());
    }

    private CommandAlertDTO toDto(CommandAlert alert) {
        CommandAlertDTO dto = new CommandAlertDTO();
        dto.setId(alert.getId());
        dto.setTitle(alert.getTitle());
        dto.setDescription(alert.getDescription());
        dto.setDepartment(alert.getDepartment());
        dto.setPatientName(alert.getPatientName());
        dto.setPatientIdentifier(alert.getPatientIdentifier());
        dto.setSeverity(alert.getSeverity());
        dto.setStatus(alert.getStatus());
        dto.setOwnerName(alert.getOwnerName());
        dto.setSlaMinutes(alert.getSlaMinutes());
        dto.setRecommendedAction(alert.getRecommendedAction());
        dto.setResolutionNotes(alert.getResolutionNotes());
        dto.setResolvedAt(alert.getResolvedAt());
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setUpdatedAt(alert.getUpdatedAt());
        return dto;
    }

    private boolean isBreached(CommandAlert alert) {
        if ("RESOLVED".equals(alert.getStatus()) || alert.getCreatedAt() == null || alert.getSlaMinutes() == null) {
            return false;
        }
        return Duration.between(alert.getCreatedAt(), LocalDateTime.now()).toMinutes() > alert.getSlaMinutes();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.trim().replace(' ', '_').toUpperCase(Locale.ROOT);
    }
}
