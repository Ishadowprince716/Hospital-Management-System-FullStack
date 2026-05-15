package com.hospital.service;

import com.hospital.dto.HousekeepingRequestDTO;
import com.hospital.model.HousekeepingRequest;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.HousekeepingRequestRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class HousekeepingRequestService {

    private final HousekeepingRequestRepository housekeepingRepository;
    private final PatientRepository patientRepository;

    public HousekeepingRequestService(HousekeepingRequestRepository housekeepingRepository,
                                      PatientRepository patientRepository) {
        this.housekeepingRepository = housekeepingRepository;
        this.patientRepository = patientRepository;
    }

    public List<HousekeepingRequestDTO> getAll() {
        return housekeepingRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<HousekeepingRequestDTO> getByPatient(Long patientId) {
        return housekeepingRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", housekeepingRepository.countByStatus("REQUESTED"),
                "assigned", housekeepingRepository.countByStatus("ASSIGNED"),
                "completed", housekeepingRepository.countByStatus("COMPLETED"),
                "urgent", housekeepingRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public HousekeepingRequestDTO create(HousekeepingRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        HousekeepingRequest housekeeping = new HousekeepingRequest();
        housekeeping.setPatient(patient);
        apply(housekeeping, request);
        housekeeping.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(housekeepingRepository.save(housekeeping));
    }

    @Transactional
    public HousekeepingRequestDTO update(Long id, HousekeepingRequestDTO request) {
        HousekeepingRequest housekeeping = housekeepingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Housekeeping request not found"));
        if (request.getRoomNumber() != null) {
            apply(housekeeping, request);
        }
        String status = normalize(request.getStatus(), housekeeping.getStatus());
        housekeeping.setStatus(status);
        housekeeping.setPriority(normalize(request.getPriority(), housekeeping.getPriority()));
        housekeeping.setAssignedStaff(clean(request.getAssignedStaff(), ""));
        housekeeping.setCompletionNote(clean(request.getCompletionNote(), ""));
        if ("COMPLETED".equals(status) && housekeeping.getCompletedAt() == null) {
            housekeeping.setCompletedAt(LocalDateTime.now());
        }
        return toDto(housekeeping);
    }

    private void apply(HousekeepingRequest housekeeping, HousekeepingRequestDTO request) {
        housekeeping.setRoomNumber(clean(request.getRoomNumber(), "Room pending"));
        housekeeping.setRequestType(normalize(request.getRequestType(), "CLEANING"));
        housekeeping.setPriority(normalize(request.getPriority(), "NORMAL"));
        housekeeping.setDescription(clean(request.getDescription(), ""));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private HousekeepingRequestDTO toDto(HousekeepingRequest housekeeping) {
        HousekeepingRequestDTO dto = new HousekeepingRequestDTO();
        dto.setId(housekeeping.getId());
        dto.setPatientId(housekeeping.getPatient().getId());
        dto.setPatientName(housekeeping.getPatient().getFullName() != null ? housekeeping.getPatient().getFullName() : housekeeping.getPatient().getUsername());
        dto.setRoomNumber(housekeeping.getRoomNumber());
        dto.setRequestType(housekeeping.getRequestType());
        dto.setPriority(housekeeping.getPriority());
        dto.setStatus(housekeeping.getStatus());
        dto.setDescription(housekeeping.getDescription());
        dto.setAssignedStaff(housekeeping.getAssignedStaff());
        dto.setCompletionNote(housekeeping.getCompletionNote());
        dto.setCompletedAt(housekeeping.getCompletedAt());
        dto.setCreatedAt(housekeeping.getCreatedAt());
        dto.setUpdatedAt(housekeeping.getUpdatedAt());
        return dto;
    }
}
