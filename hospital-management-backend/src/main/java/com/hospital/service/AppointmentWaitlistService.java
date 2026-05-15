package com.hospital.service;

import com.hospital.dto.AppointmentWaitlistEntryDTO;
import com.hospital.model.AppointmentWaitlistEntry;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.AppointmentWaitlistEntryRepository;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentWaitlistService {

    private final AppointmentWaitlistEntryRepository waitlistRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentWaitlistService(AppointmentWaitlistEntryRepository waitlistRepository,
                                      PatientRepository patientRepository,
                                      DoctorRepository doctorRepository) {
        this.waitlistRepository = waitlistRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<AppointmentWaitlistEntryDTO> getAll() {
        return waitlistRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<AppointmentWaitlistEntryDTO> getByPatient(Long patientId) {
        return waitlistRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "waiting", waitlistRepository.countByStatus("WAITING"),
                "matched", waitlistRepository.countByStatus("MATCHED"),
                "scheduled", waitlistRepository.countByStatus("SCHEDULED"),
                "urgent", waitlistRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public AppointmentWaitlistEntryDTO create(AppointmentWaitlistEntryDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        AppointmentWaitlistEntry entry = new AppointmentWaitlistEntry();
        entry.setPatient(patient);
        applyDoctor(entry, request.getDoctorId());
        apply(entry, request);
        entry.setStatus(normalize(request.getStatus(), "WAITING"));
        return toDto(waitlistRepository.save(entry));
    }

    @Transactional
    public AppointmentWaitlistEntryDTO update(Long id, AppointmentWaitlistEntryDTO request) {
        AppointmentWaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Waitlist entry not found"));
        if (request.getDoctorId() != null) {
            applyDoctor(entry, request.getDoctorId());
        }
        if (request.getDesiredStartDate() != null || request.getSpecialty() != null) {
            apply(entry, request);
        }
        entry.setStatus(normalize(request.getStatus(), entry.getStatus()));
        entry.setPriority(normalize(request.getPriority(), entry.getPriority()));
        entry.setCoordinatorNote(clean(request.getCoordinatorNote(), ""));
        return toDto(entry);
    }

    private void applyDoctor(AppointmentWaitlistEntry entry, Long doctorId) {
        if (doctorId == null) return;
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        entry.setDoctor(doctor);
        if (entry.getSpecialty() == null || entry.getSpecialty().isBlank()) {
            entry.setSpecialty(doctor.getSpecialization());
        }
    }

    private void apply(AppointmentWaitlistEntry entry, AppointmentWaitlistEntryDTO request) {
        entry.setSpecialty(clean(request.getSpecialty(), entry.getDoctor() != null ? entry.getDoctor().getSpecialization() : "General Medicine"));
        entry.setCurrentAppointmentDate(request.getCurrentAppointmentDate());
        entry.setDesiredStartDate(request.getDesiredStartDate() != null ? request.getDesiredStartDate() : LocalDate.now());
        entry.setDesiredEndDate(request.getDesiredEndDate());
        entry.setTimePreference(clean(request.getTimePreference(), "ANYTIME"));
        entry.setPriority(normalize(request.getPriority(), "NORMAL"));
        entry.setReason(clean(request.getReason(), "Earlier appointment requested"));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private AppointmentWaitlistEntryDTO toDto(AppointmentWaitlistEntry entry) {
        AppointmentWaitlistEntryDTO dto = new AppointmentWaitlistEntryDTO();
        dto.setId(entry.getId());
        dto.setPatientId(entry.getPatient().getId());
        dto.setPatientName(entry.getPatient().getFullName() != null ? entry.getPatient().getFullName() : entry.getPatient().getUsername());
        if (entry.getDoctor() != null) {
            dto.setDoctorId(entry.getDoctor().getId());
            dto.setDoctorName(entry.getDoctor().getFullName());
        }
        dto.setSpecialty(entry.getSpecialty());
        dto.setCurrentAppointmentDate(entry.getCurrentAppointmentDate());
        dto.setDesiredStartDate(entry.getDesiredStartDate());
        dto.setDesiredEndDate(entry.getDesiredEndDate());
        dto.setTimePreference(entry.getTimePreference());
        dto.setPriority(entry.getPriority());
        dto.setStatus(entry.getStatus());
        dto.setReason(entry.getReason());
        dto.setCoordinatorNote(entry.getCoordinatorNote());
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setUpdatedAt(entry.getUpdatedAt());
        return dto;
    }
}
