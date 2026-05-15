package com.hospital.service;

import com.hospital.dto.EmergencyTransportRequestDTO;
import com.hospital.model.EmergencyTransportRequest;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.EmergencyTransportRequestRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class EmergencyTransportRequestService {

    private final EmergencyTransportRequestRepository transportRepository;
    private final PatientRepository patientRepository;

    public EmergencyTransportRequestService(EmergencyTransportRequestRepository transportRepository,
                                            PatientRepository patientRepository) {
        this.transportRepository = transportRepository;
        this.patientRepository = patientRepository;
    }

    public List<EmergencyTransportRequestDTO> getAll() {
        return transportRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<EmergencyTransportRequestDTO> getByPatient(Long patientId) {
        return transportRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", transportRepository.countByStatus("REQUESTED"),
                "dispatched", transportRepository.countByStatus("DISPATCHED"),
                "completed", transportRepository.countByStatus("COMPLETED"),
                "critical", transportRepository.countBySeverity("CRITICAL")
        );
    }

    @Transactional
    public EmergencyTransportRequestDTO create(EmergencyTransportRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        EmergencyTransportRequest transport = new EmergencyTransportRequest();
        transport.setPatient(patient);
        apply(transport, request);
        transport.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(transportRepository.save(transport));
    }

    @Transactional
    public EmergencyTransportRequestDTO update(Long id, EmergencyTransportRequestDTO request) {
        EmergencyTransportRequest transport = transportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emergency transport request not found"));
        if (request.getPickupLocation() != null) {
            apply(transport, request);
        }
        transport.setStatus(normalize(request.getStatus(), transport.getStatus()));
        transport.setSeverity(normalize(request.getSeverity(), transport.getSeverity()));
        transport.setVehicleNumber(clean(request.getVehicleNumber(), ""));
        transport.setCrewName(clean(request.getCrewName(), ""));
        transport.setEtaMinutes(request.getEtaMinutes());
        transport.setDispatcherNote(clean(request.getDispatcherNote(), ""));
        return toDto(transport);
    }

    private void apply(EmergencyTransportRequest transport, EmergencyTransportRequestDTO request) {
        transport.setPickupLocation(clean(request.getPickupLocation(), "Pickup location pending"));
        transport.setDestination(clean(request.getDestination(), "Hospital emergency entrance"));
        transport.setContactPhone(clean(request.getContactPhone(), "Not provided"));
        transport.setTransportType(normalize(request.getTransportType(), "AMBULANCE"));
        transport.setSeverity(normalize(request.getSeverity(), "MODERATE"));
        transport.setSymptoms(clean(request.getSymptoms(), ""));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private EmergencyTransportRequestDTO toDto(EmergencyTransportRequest transport) {
        EmergencyTransportRequestDTO dto = new EmergencyTransportRequestDTO();
        dto.setId(transport.getId());
        dto.setPatientId(transport.getPatient().getId());
        dto.setPatientName(transport.getPatient().getFullName() != null ? transport.getPatient().getFullName() : transport.getPatient().getUsername());
        dto.setPickupLocation(transport.getPickupLocation());
        dto.setDestination(transport.getDestination());
        dto.setContactPhone(transport.getContactPhone());
        dto.setTransportType(transport.getTransportType());
        dto.setSeverity(transport.getSeverity());
        dto.setStatus(transport.getStatus());
        dto.setSymptoms(transport.getSymptoms());
        dto.setVehicleNumber(transport.getVehicleNumber());
        dto.setCrewName(transport.getCrewName());
        dto.setEtaMinutes(transport.getEtaMinutes());
        dto.setDispatcherNote(transport.getDispatcherNote());
        dto.setCreatedAt(transport.getCreatedAt());
        dto.setUpdatedAt(transport.getUpdatedAt());
        return dto;
    }
}
