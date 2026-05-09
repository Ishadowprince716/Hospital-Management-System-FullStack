package com.hospital.service;

import com.hospital.config.JwtUtil;
import com.hospital.dto.AuthResponse;
import com.hospital.dto.FirebaseLoginRequest;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.RegisterRequest;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Authentication Service
 * Handles user login, registration, and account verification
 * 
 * Features:
 * - Input validation and sanitization
 * - Secure password verification
 * - Role-based access control
 * - Account activation via OTP
 * - Comprehensive logging
 * - Transaction management
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    // Validation patterns
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,50}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PASSWORD_MIN_LENGTH = Pattern.compile("^.{6,}$");

    // Valid roles
    private static final List<String> VALID_ROLES = List.of("PATIENT", "DOCTOR", "ADMIN");

    // Constants
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final RestTemplate restTemplate;

    @Value("${firebase.web-api-key}")
    private String firebaseWebApiKey;

    /**
     * Constructor with dependency injection
     */
    public AuthService(UserRepository userRepository, PatientRepository patientRepository,
            DoctorRepository doctorRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            OtpService otpService, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.restTemplate = restTemplate;
    }

    /**
     * Authenticate user with username, password, and role
     * 
     * @param request Login credentials and role
     * @return AuthResponse with JWT token and user details
     * @throws IllegalArgumentException if input validation fails
     * @throws RuntimeException         if authentication fails
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Validate input
        validateLoginRequest(request);

        logger.info("Login attempt for username: {}", request.getUsername());

        try {
            // Find user by username
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

            if (userOpt.isEmpty()) {
                logger.warn("Login failed: User not found - {}", request.getUsername());
                throw new RuntimeException("Invalid username or password");
            }

            User user = userOpt.get();

            // Verify password securely
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                logger.warn("Login failed: Invalid password for user - {}", request.getUsername());
                throw new RuntimeException("Invalid username or password");
            }

            // Validate role matches
            if (!user.getRole().equalsIgnoreCase(request.getRole())) {
                logger.warn("Login failed: Role mismatch for user - {}, requested: {}",
                        request.getUsername(), request.getRole());
                throw new RuntimeException("Invalid role selected");
            }

            // Strict Admin Access Control - Only 'whoami' allowed
            if ("ADMIN".equalsIgnoreCase(user.getRole()) && !"whoami".equalsIgnoreCase(user.getUsername())) {
                logger.warn("Login failed: Unauthorized admin access attempt - {}", request.getUsername());
                throw new RuntimeException("Unauthorized admin access");
            }

            // Check account status
            if (!user.getIsActive()) {
                logger.warn("Login failed: Inactive account - {}", request.getUsername());
                throw new RuntimeException("Account is inactive. Contact administrator.");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());

            logger.info("Login successful for user: {} with role: {}", request.getUsername(), user.getRole());

            return new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getRole(),
                    user.getId(),
                    user.getFullName(),
                    "Login successful");

        } catch (Exception e) {
            logger.error("Login error for user {}: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    /**
     * Register new user with validation
     * 
     * @param request Registration details
     * @return AuthResponse with OTP verification message
     * @throws IllegalArgumentException if validation fails
     * @throws RuntimeException         if registration fails
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registration attempt for username: {}", request.getUsername());

        // Validate registration input
        validateRegisterRequest(request);

        // Check for duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Registration failed: Username already exists - {}", request.getUsername());
            throw new RuntimeException("Username already exists");
        }

        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        try {
            // Create user based on role
            String role = request.getRole() != null ? request.getRole().toUpperCase() : "PATIENT";
            User user = createUserByRole(request);
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setProvider("LOCAL");
            user.setRole(role);

            String message;

            user.setIsActive(true); // All users active by default for now
            message = "Registration successful! Please login.";

            userRepository.save(user);
            logger.info("User registered: {} with role: {}", request.getUsername(), user.getRole());

            return new AuthResponse(
                    null,
                    user.getUsername(),
                    user.getRole(),
                    user.getId(),
                    user.getFullName(),
                    message);

        } catch (Exception e) {
            logger.error("Registration error for username {}: {}", request.getUsername(), e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse loginWithFirebase(FirebaseLoginRequest request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new IllegalArgumentException("Firebase ID token is required");
        }

        String requestedRole = request.getRole() != null ? request.getRole().toUpperCase() : "PATIENT";
        if (!List.of("PATIENT", "DOCTOR").contains(requestedRole)) {
            throw new IllegalArgumentException("Firebase login is available for patient and doctor accounts only");
        }

        FirebaseUserInfo firebaseUser = verifyFirebaseToken(request.getIdToken());
        User user = userRepository.findByEmail(firebaseUser.email())
                .map(existing -> updateFirebaseUser(existing, firebaseUser, requestedRole))
                .orElseGet(() -> createFirebaseUser(firebaseUser, requestedRole));

        if (!user.getRole().equalsIgnoreCase(requestedRole)) {
            throw new RuntimeException("This Firebase account is registered as " + user.getRole()
                    + ". Select the " + user.getRole() + " role to continue.");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is inactive. Contact administrator.");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());
        return new AuthResponse(
                token,
                user.getUsername(),
                user.getRole(),
                user.getId(),
                user.getFullName(),
                "Firebase login successful");
    }

    /**
     * Initialize default test users (called on application startup)
     */
    /**
     * Initialize default test users (called on application startup)
     */
    @Transactional
    public void initializeDefaultUsers() {
        logger.info("Initializing default users");

        // Create Admin (Requested custom admin)
        if (!userRepository.existsByUsername("whoami")) {
            User admin = new User();
            admin.setUsername("whoami");
            admin.setPassword(passwordEncoder.encode("iamgroot"));
            admin.setEmail("whoami@hospital.com");
            admin.setPhoneNumber("0000000000");
            admin.setRole("ADMIN");
            admin.setFullName("Root Administrator");
            admin.setIsActive(true);
            userRepository.save(admin);
            logger.info("Custom admin user 'whoami' created");
        }

        // NOTE: Default Doctor and Patient creation removed to enforce real-time data
        // only.
    }

    /**
     * Verify OTP and activate user account
     * 
     * @param email User email address
     * @param otp   OTP code
     * @return AuthResponse with JWT token
     * @throws RuntimeException if OTP validation fails
     */
    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        logger.info("OTP verification attempt for email: {}", email);

        if (!otpService.validateOtp(email, otp)) {
            logger.warn("OTP verification failed: Invalid OTP for email - {}", email);
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("OTP verification failed: User not found for email - {}", email);
                    return new RuntimeException("User not found");
                });

        user.setIsActive(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());
        logger.info("OTP verified and user activated: {}", user.getUsername());

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getRole(),
                user.getId(),
                user.getFullName(),
                "Verification successful");
    }

    @SuppressWarnings("unchecked")
    private FirebaseUserInfo verifyFirebaseToken(String idToken) {
        if (firebaseWebApiKey == null || firebaseWebApiKey.isBlank()) {
            throw new RuntimeException("Firebase web API key is not configured");
        }

        String url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + firebaseWebApiKey;
        Map<String, String> body = Map.of("idToken", idToken);

        Map<String, Object> response = restTemplate.postForObject(url, body, Map.class);
        List<Map<String, Object>> users = response != null
                ? (List<Map<String, Object>>) response.get("users")
                : null;

        if (users == null || users.isEmpty()) {
            throw new RuntimeException("Invalid Firebase session");
        }

        Map<String, Object> user = users.get(0);
        String uid = stringValue(user.get("localId"));
        String email = stringValue(user.get("email"));
        String name = stringValue(user.get("displayName"));
        String photoUrl = stringValue(user.get("photoUrl"));

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Firebase account email is required");
        }

        return new FirebaseUserInfo(uid, email, name, photoUrl);
    }

    private User createFirebaseUser(FirebaseUserInfo firebaseUser, String role) {
        User user = "DOCTOR".equals(role) ? new Doctor() : new Patient();
        user.setUsername(uniqueFirebaseUsername(firebaseUser.email(), firebaseUser.uid()));
        user.setEmail(firebaseUser.email());
        user.setPassword(passwordEncoder.encode("FIREBASE_AUTH:" + firebaseUser.uid()));
        user.setFullName(displayName(firebaseUser));
        user.setPhoneNumber("0000000000");
        user.setProvider("FIREBASE");
        user.setProviderId(firebaseUser.uid());
        user.setProfilePictureUrl(firebaseUser.photoUrl());
        user.setRole(role);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    private User updateFirebaseUser(User user, FirebaseUserInfo firebaseUser, String requestedRole) {
        if (!user.getRole().equalsIgnoreCase(requestedRole)) {
            return user;
        }

        user.setProvider("FIREBASE");
        user.setProviderId(firebaseUser.uid());
        if (firebaseUser.photoUrl() != null && !firebaseUser.photoUrl().isBlank()) {
            user.setProfilePictureUrl(firebaseUser.photoUrl());
        }
        if ((user.getFullName() == null || user.getFullName().isBlank())
                && firebaseUser.displayName() != null && !firebaseUser.displayName().isBlank()) {
            user.setFullName(firebaseUser.displayName());
        }
        return userRepository.save(user);
    }

    private String uniqueFirebaseUsername(String email, String uid) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^A-Za-z0-9_]", "_");
        if (base.length() < 3) {
            base = "user_" + base;
        }
        if (base.length() > 42) {
            base = base.substring(0, 42);
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            String uidSuffix = uid != null && uid.length() >= 6 ? uid.substring(0, 6) : String.valueOf(suffix++);
            candidate = base + "_" + uidSuffix;
            if (candidate.length() > 50) {
                candidate = candidate.substring(0, 50);
            }
            if (!userRepository.existsByUsername(candidate)) {
                break;
            }
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    private String displayName(FirebaseUserInfo firebaseUser) {
        if (firebaseUser.displayName() != null && !firebaseUser.displayName().isBlank()) {
            return firebaseUser.displayName();
        }
        return firebaseUser.email().substring(0, firebaseUser.email().indexOf('@'));
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : null;
    }

    private record FirebaseUserInfo(String uid, String email, String displayName, String photoUrl) {
    }

    // ============== Private Validation Methods ==============

    /**
     * Validate login request input
     * 
     * @param request LoginRequest to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateLoginRequest(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Login request cannot be null");
        }

        String username = request.getUsername();
        String password = request.getPassword();
        String role = request.getRole();

        // Validate username
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Invalid username format");
        }

        // Validate password
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Validate role
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }

        if (!VALID_ROLES.contains(role.toUpperCase())) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }

    }

    /**
     * Validate registration request input
     * 
     * @param request RegisterRequest to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        // Validate username
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (!USERNAME_PATTERN.matcher(request.getUsername()).matches()) {
            throw new IllegalArgumentException("Username must be 3-50 characters (letters, numbers, underscore)");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (!PASSWORD_MIN_LENGTH.matcher(request.getPassword()).matches()) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Validate full name
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name cannot be empty");
        }

        // Validate phone number
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }
        if (!request.getPhoneNumber().matches("\\d{10}")) {
            throw new IllegalArgumentException("Phone number must be 10 digits");
        }

        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new IllegalArgumentException("Admin registration is not public.");
        }
    }

    /**
     * Create user instance based on role
     * 
     * @param request Registration request
     * @return User instance (Patient, Doctor, or generic User)
     */
    private User createUserByRole(RegisterRequest request) {
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "PATIENT";

        if ("DOCTOR".equals(role)) {
            return new Doctor();
        } else if ("PATIENT".equals(role)) {
            return new Patient();
        } else {
            return new User();
        }
    }
}
