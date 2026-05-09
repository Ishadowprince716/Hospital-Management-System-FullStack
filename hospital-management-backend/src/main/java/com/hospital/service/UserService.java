package com.hospital.service;

import com.hospital.model.User;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public String updateProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        String fileName = fileStorageService.storeFile(file);
        
        // In this implementation, we store the filename or a relative path
        // The controller or a configuration should handle serving these files
        String fileUrl = "/api/uploads/" + fileName; 
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
    public User updateUser(Long id, java.util.Map<String, String> updates) {
        User user = getUserById(id);
        if (updates.containsKey("fullName"))    user.setFullName(updates.get("fullName"));
        if (updates.containsKey("email"))       user.setEmail(updates.get("email"));
        if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
