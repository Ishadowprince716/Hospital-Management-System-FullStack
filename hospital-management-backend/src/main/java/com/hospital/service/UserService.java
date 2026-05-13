package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.function.Consumer;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, FileStorageService fileStorageService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String updateProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        String fileName = fileStorageService.storeFile(file);

        // In this implementation, we store the filename or a relative path
        // The controller or a configuration should handle serving these files
        String fileUrl = "/uploads/" + fileName;
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);

        return fileUrl;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User updateUser(Long id, Map<String, String> updates) {
        User user = getUserById(id);

        updateString(updates, "fullName", user::setFullName);
        updateString(updates, "email", user::setEmail);
        updateString(updates, "phoneNumber", user::setPhoneNumber);
        updateString(updates, "profilePictureUrl", user::setProfilePictureUrl);

        if (user instanceof Patient patient) {
            updateLocalDate(updates, "dateOfBirth", patient::setDateOfBirth);
            updateString(updates, "gender", patient::setGender);
            updateString(updates, "bloodGroup", patient::setBloodGroup);
            updateString(updates, "address", patient::setAddress);
            updateString(updates, "emergencyContact", patient::setEmergencyContact);
            updateString(updates, "emergencyContactName", patient::setEmergencyContactName);
            updateString(updates, "insuranceProvider", patient::setInsuranceProvider);
            updateString(updates, "insuranceNumber", patient::setInsuranceNumber);
            updateString(updates, "allergies", patient::setAllergies);
            updateString(updates, "currentMedications", patient::setCurrentMedications);
        }

        if (user instanceof Doctor doctor) {
            updateString(updates, "specialization", doctor::setSpecialization);
            updateString(updates, "qualification", doctor::setQualification);
            updateInteger(updates, "experienceYears", doctor::setExperienceYears);
            updateDouble(updates, "consultationFee", doctor::setConsultationFee);
            updateString(updates, "department", doctor::setDepartment);
            updateString(updates, "licenseNumber", doctor::setLicenseNumber);
            updateString(updates, "availableDays", doctor::setAvailableDays);
            updateString(updates, "availableTimeStart", doctor::setAvailableTimeStart);
            updateString(updates, "availableTimeEnd", doctor::setAvailableTimeEnd);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long id, Map<String, String> request) {
        User user = getUserById(id);
        String currentPassword = clean(request.get("currentPassword"));
        String newPassword = clean(request.get("newPassword"));

        if (currentPassword == null) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    private void updateString(Map<String, String> updates, String key, Consumer<String> setter) {
        if (updates.containsKey(key)) {
            setter.accept(clean(updates.get(key)));
        }
    }

    private void updateLocalDate(Map<String, String> updates, String key, Consumer<LocalDate> setter) {
        if (!updates.containsKey(key)) return;
        String value = clean(updates.get(key));
        if (value == null) {
            setter.accept(null);
            return;
        }
        try {
            setter.accept(LocalDate.parse(value));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format for " + key + ". Use YYYY-MM-DD.");
        }
    }

    private void updateInteger(Map<String, String> updates, String key, Consumer<Integer> setter) {
        if (!updates.containsKey(key)) return;
        String value = clean(updates.get(key));
        if (value == null) {
            setter.accept(null);
            return;
        }
        try {
            setter.accept(Integer.valueOf(value));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number for " + key);
        }
    }

    private void updateDouble(Map<String, String> updates, String key, Consumer<Double> setter) {
        if (!updates.containsKey(key)) return;
        String value = clean(updates.get(key));
        if (value == null) {
            setter.accept(null);
            return;
        }
        try {
            setter.accept(Double.valueOf(value));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount for " + key);
        }
    }

    private String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
