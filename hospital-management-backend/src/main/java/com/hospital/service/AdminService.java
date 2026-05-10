package com.hospital.service;

import com.hospital.dto.DashboardDTO;
import com.hospital.dto.UserRequestDTO;
import com.hospital.model.User;
import com.hospital.repository.mysql.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;

    public AdminService(PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            BillRepository billRepository,
            UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
        this.userRepository = userRepository;
    }

    @Cacheable(value = "dashboardStats")
    @Transactional(readOnly = true)
    public DashboardDTO getDashboardStats() {
        return DashboardDTO.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorRepository.count())
                .todayAppointments(appointmentRepository.count()) // Note: Should be filtered by today
                .totalRevenue(billRepository.findByStatus("PAID").stream()
                        .mapToDouble(bill -> bill.getAmount() != null ? bill.getAmount() : 0.0)
                        .sum())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    @Transactional
    public User createUser(UserRequestDTO userRequest) {
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User newUser = new User();
        newUser.setUsername(userRequest.getUsername());
        newUser.setEmail(userRequest.getEmail());
        newUser.setPassword(userRequest.getPassword()); // In production, this should be hashed
        newUser.setFullName(userRequest.getFullName());
        newUser.setRole(userRequest.getRole());
        newUser.setIsActive(true);
        newUser.setPhoneNumber(userRequest.getPhoneNumber());

        return userRepository.save(newUser);
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    @Transactional
    public User updateUser(Long userId, UserRequestDTO userRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userRequest.getFullName() != null) user.setFullName(userRequest.getFullName());
        if (userRequest.getEmail() != null) user.setEmail(userRequest.getEmail());
        if (userRequest.getPhoneNumber() != null) user.setPhoneNumber(userRequest.getPhoneNumber());
        if (userRequest.getRole() != null) user.setRole(userRequest.getRole());
        
        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            user.setPassword(userRequest.getPassword()); // Should be hashed in production
        }

        return userRepository.save(user);
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    @Transactional
    public User updateUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(isActive);
        return userRepository.save(user);
    }
}
