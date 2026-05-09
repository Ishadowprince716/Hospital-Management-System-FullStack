package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.repository.mysql.DoctorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Page<Doctor> getAllActiveDoctors(Pageable pageable) {
        return doctorRepository.findByIsActive(true, pageable);
    }

    public List<Doctor> getAllActiveDoctors() {
        return doctorRepository.findByIsActive(true);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }
}
