package com.hospital.service;

import com.hospital.dto.DietaryMealRequestDTO;
import com.hospital.model.DietaryMealRequest;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.DietaryMealRequestRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class DietaryMealRequestService {

    private final DietaryMealRequestRepository mealRepository;
    private final PatientRepository patientRepository;

    public DietaryMealRequestService(DietaryMealRequestRepository mealRepository,
                                     PatientRepository patientRepository) {
        this.mealRepository = mealRepository;
        this.patientRepository = patientRepository;
    }

    public List<DietaryMealRequestDTO> getAll() {
        return mealRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<DietaryMealRequestDTO> getByPatient(Long patientId) {
        return mealRepository.findByPatient_IdOrderByUpdatedAtDesc(patientId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "requested", mealRepository.countByStatus("REQUESTED"),
                "preparing", mealRepository.countByStatus("PREPARING"),
                "delivered", mealRepository.countByStatus("DELIVERED"),
                "urgent", mealRepository.countByPriority("URGENT")
        );
    }

    @Transactional
    public DietaryMealRequestDTO create(DietaryMealRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        DietaryMealRequest meal = new DietaryMealRequest();
        meal.setPatient(patient);
        apply(meal, request);
        meal.setStatus(normalize(request.getStatus(), "REQUESTED"));
        return toDto(mealRepository.save(meal));
    }

    @Transactional
    public DietaryMealRequestDTO update(Long id, DietaryMealRequestDTO request) {
        DietaryMealRequest meal = mealRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dietary meal request not found"));
        if (request.getMealDate() != null || request.getDietType() != null) {
            apply(meal, request);
        }
        meal.setStatus(normalize(request.getStatus(), meal.getStatus()));
        meal.setPriority(normalize(request.getPriority(), meal.getPriority()));
        meal.setNutritionNote(clean(request.getNutritionNote(), ""));
        return toDto(meal);
    }

    private void apply(DietaryMealRequest meal, DietaryMealRequestDTO request) {
        meal.setMealDate(request.getMealDate() != null ? request.getMealDate() : LocalDate.now());
        meal.setMealType(normalize(request.getMealType(), "LUNCH"));
        meal.setDietType(normalize(request.getDietType(), "REGULAR"));
        meal.setRoomNumber(clean(request.getRoomNumber(), ""));
        meal.setAllergyNotes(clean(request.getAllergyNotes(), ""));
        meal.setPreferences(clean(request.getPreferences(), ""));
        meal.setPriority(normalize(request.getPriority(), "NORMAL"));
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private DietaryMealRequestDTO toDto(DietaryMealRequest meal) {
        DietaryMealRequestDTO dto = new DietaryMealRequestDTO();
        dto.setId(meal.getId());
        dto.setPatientId(meal.getPatient().getId());
        dto.setPatientName(meal.getPatient().getFullName() != null ? meal.getPatient().getFullName() : meal.getPatient().getUsername());
        dto.setMealDate(meal.getMealDate());
        dto.setMealType(meal.getMealType());
        dto.setDietType(meal.getDietType());
        dto.setRoomNumber(meal.getRoomNumber());
        dto.setAllergyNotes(meal.getAllergyNotes());
        dto.setPreferences(meal.getPreferences());
        dto.setPriority(meal.getPriority());
        dto.setStatus(meal.getStatus());
        dto.setNutritionNote(meal.getNutritionNote());
        dto.setCreatedAt(meal.getCreatedAt());
        dto.setUpdatedAt(meal.getUpdatedAt());
        return dto;
    }
}
