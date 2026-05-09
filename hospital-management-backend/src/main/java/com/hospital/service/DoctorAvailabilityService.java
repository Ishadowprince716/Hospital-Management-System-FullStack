package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.repository.mysql.DoctorAvailabilityRepository;
import com.hospital.repository.mysql.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(DoctorAvailabilityRepository availabilityRepository,
                                    DoctorRepository doctorRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailability> getDoctorAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId);
    }

    @Transactional
    public DoctorAvailability setAvailability(Long doctorId, String dayOfWeek, LocalTime startTime, LocalTime endTime, Integer slotDuration) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorAvailability availability = new DoctorAvailability(doctor, dayOfWeek, startTime, endTime);
        if (slotDuration != null) {
            availability.setSlotDuration(slotDuration);
        }

        return availabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> getAvailableSlots(Long doctorId, String date) {
        // This is a simplified version - in production, you'd check existing appointments
        List<Map<String, String>> slots = new ArrayList<>();

        // Generate sample slots (9 AM to 5 PM, 30-minute intervals)
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(17, 0);

        while (start.isBefore(end)) {
            Map<String, String> slot = new HashMap<>();
            slot.put("time", start.toString());
            slot.put("available", "true");
            slots.add(slot);
            start = start.plusMinutes(30);
        }

        return slots;
    }

    @Transactional
    public void deleteAvailability(Long id) {
        if (availabilityRepository.existsById(id)) {
            availabilityRepository.deleteById(id);
        } else {
            throw new RuntimeException("Availability not found with ID: " + id);
        }
    }
}
