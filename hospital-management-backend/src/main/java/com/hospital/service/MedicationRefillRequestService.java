package com.hospital.service;

import com.hospital.dto.MedicationRefillRequestDTO;
import com.hospital.model.MedicationRefillRequest;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.MedicationRefillRequestRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class MedicationRefillRequestService {

    private final MedicationRefillRequestRepository refillRepository;
    private final PatientRepository patientRepository;

    public MedicationRefillRequestService(MedicationRefillRequestRepository refillRepository,
                                          PatientRepository patientRepository) {
        this.refillRepository = refillRepository;
        this.patientRepository = patientRepository;
    }

    public List<MedicationRefillRequestDTO> getAll() {
        return refillRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<MedicationRefillRequestDTO> getByPatient(Long patientId) {
        return refillRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", refillRepository.countByStatus("REQUESTED"),
                "inReview", refillRepository.countByStatus("IN_REVIEW"),
                "ready", refillRepository.countByStatus("READY"),
                "urgent", refillRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public MedicationRefillRequestDTO create(MedicationRefillRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        MedicationRefillRequest refill = new MedicationRefillRequest();
        refill.setPatient(patient);
        apply(refill, request);
        refill.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(refillRepository.save(refill));
    }

    @Transactional
    public MedicationRefillRequestDTO update(Long id, MedicationRefillRequestDTO request) {
        MedicationRefillRequest refill = refillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medication refill request not found"));
        if (request.getMedicationName() != null) {
            apply(refill, request);
        }
        refill.setStatus(normalize(request.getStatus(), refill.getStatus()));
        refill.setPriority(normalize(request.getPriority(), refill.getPriority()));
        refill.setPharmacistNote(clean(request.getPharmacistNote(), ""));
        return toDto(refill);
    }

    private void apply(MedicationRefillRequest refill, MedicationRefillRequestDTO request) {
        refill.setMedicationName(clean(request.getMedicationName(), "Medication refill"));
        refill.setDosage(clean(request.getDosage(), ""));
        refill.setLastPrescriptionRef(clean(request.getLastPrescriptionRef(), ""));
        refill.setQuantity(clean(request.getQuantity(), ""));
        refill.setPreferredPickupDate(request.getPreferredPickupDate());
        refill.setDeliveryOption(normalize(request.getDeliveryOption(), "PICKUP"));
        refill.setPriority(normalize(request.getPriority(), "NORMAL"));
        refill.setNotes(clean(request.getNotes(), ""));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private MedicationRefillRequestDTO toDto(MedicationRefillRequest refill) {
        MedicationRefillRequestDTO dto = new MedicationRefillRequestDTO();
        dto.setId(refill.getId());
        dto.setPatientId(refill.getPatient().getId());
        dto.setPatientName(refill.getPatient().getFullName() != null ? refill.getPatient().getFullName() : refill.getPatient().getUsername());
        dto.setMedicationName(refill.getMedicationName());
        dto.setDosage(refill.getDosage());
        dto.setLastPrescriptionRef(refill.getLastPrescriptionRef());
        dto.setQuantity(refill.getQuantity());
        dto.setPreferredPickupDate(refill.getPreferredPickupDate());
        dto.setDeliveryOption(refill.getDeliveryOption());
        dto.setStatus(refill.getStatus());
        dto.setPriority(refill.getPriority());
        dto.setNotes(refill.getNotes());
        dto.setPharmacistNote(refill.getPharmacistNote());
        dto.setCreatedAt(refill.getCreatedAt());
        dto.setUpdatedAt(refill.getUpdatedAt());
        return dto;
    }
}
