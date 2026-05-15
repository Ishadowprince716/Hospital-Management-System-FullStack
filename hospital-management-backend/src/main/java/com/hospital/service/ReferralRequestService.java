package com.hospital.service;

import com.hospital.dto.ReferralRequestDTO;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.ReferralRequest;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.ReferralRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ReferralRequestService {

    private final ReferralRequestRepository referralRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public ReferralRequestService(ReferralRequestRepository referralRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository) {
        this.referralRepository = referralRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<ReferralRequestDTO> getAll() {
        return referralRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<ReferralRequestDTO> getByPatient(Long patientId) {
        return referralRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public List<ReferralRequestDTO> getByDoctor(Long doctorId) {
        return referralRepository.findByReferringDoctor_IdOrderByUpdatedAtDesc(doctorId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", referralRepository.countByStatus("REQUESTED"),
                "scheduled", referralRepository.countByStatus("SCHEDULED"),
                "completed", referralRepository.countByStatus("COMPLETED"),
                "urgent", referralRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public ReferralRequestDTO create(ReferralRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        Doctor doctor = doctorRepository.findById(request.getReferringDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        ReferralRequest referral = new ReferralRequest();
        referral.setPatient(patient);
        referral.setReferringDoctor(doctor);
        apply(referral, request);
        referral.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(referralRepository.save(referral));
    }

    @Transactional
    public ReferralRequestDTO update(Long id, ReferralRequestDTO request) {
        ReferralRequest referral = referralRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referral request not found"));
        apply(referral, request);
        referral.setStatus(normalize(request.getStatus(), referral.getStatus()));
        referral.setCoordinatorNote(clean(request.getCoordinatorNote(), ""));
        return toDto(referral);
    }

    private void apply(ReferralRequest referral, ReferralRequestDTO request) {
        referral.setSpecialty(clean(request.getSpecialty(), "General Medicine"));
        referral.setPriority(normalize(request.getPriority(), "ROUTINE"));
        referral.setReason(clean(request.getReason(), "Referral requested"));
        referral.setNotes(clean(request.getNotes(), ""));
        referral.setPreferredDate(request.getPreferredDate());
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private ReferralRequestDTO toDto(ReferralRequest referral) {
        ReferralRequestDTO dto = new ReferralRequestDTO();
        dto.setId(referral.getId());
        dto.setPatientId(referral.getPatient().getId());
        dto.setPatientName(referral.getPatient().getFullName() != null ? referral.getPatient().getFullName() : referral.getPatient().getUsername());
        dto.setReferringDoctorId(referral.getReferringDoctor().getId());
        dto.setReferringDoctorName(referral.getReferringDoctor().getFullName());
        dto.setSpecialty(referral.getSpecialty());
        dto.setPriority(referral.getPriority());
        dto.setStatus(referral.getStatus());
        dto.setReason(referral.getReason());
        dto.setNotes(referral.getNotes());
        dto.setPreferredDate(referral.getPreferredDate());
        dto.setCoordinatorNote(referral.getCoordinatorNote());
        dto.setCreatedAt(referral.getCreatedAt());
        dto.setUpdatedAt(referral.getUpdatedAt());
        return dto;
    }
}
