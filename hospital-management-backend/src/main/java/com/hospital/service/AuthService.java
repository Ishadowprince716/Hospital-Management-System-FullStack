package com.hospital.service;

import com.hospital.config.JwtUtil;
import com.hospital.dto.AuthResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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
    private final EmailService emailService;
    private final OtpService otpService;

    /**
     * Constructor with dependency injection
     */
    public AuthService(UserRepository userRepository, PatientRepository patientRepository,
            DoctorRepository doctorRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            EmailService emailService, OtpService otpService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.otpService = otpService;
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

            if ("DOCTOR".equals(role)) {
                user.setIsActive(false); // Doctor requires approval
                message = "Registration successful! Account pending admin approval.";
            } else {
                user.setIsActive(true); // Patient is active immediately
                message = "Registration successful! Please login.";
            }

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

    /**
     * Initialize default test users (called on application startup)
     */
    @Transactional
    public void initializeDefaultUsers() {
        logger.info("Initializing default users");

        // Create Admin
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

        // Create Doctor
        if (!userRepository.existsByUsername("doctor1")) {
            Doctor doctor = new Doctor();
            doctor.setUsername("doctor1");
            doctor.setPassword(passwordEncoder.encode("doctor123"));
            doctor.setEmail("doctor@hospital.com");
            doctor.setPhoneNumber("9876543210");
            doctor.setRole("DOCTOR");
            doctor.setFullName("Dr. Rahul Singh Kushwaha");
            doctor.setSpecialization("General Physician");
            doctor.setQualification("MBBS, MD");
            doctor.setExperienceYears(5);
            doctor.setConsultationFee(500.0);
            doctor.setDepartment("General Medicine");
            doctor.setLicenseNumber("DOC123456");
            doctor.setAvailableDays("[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]");
            doctor.setAvailableTimeStart("09:00");
            doctor.setAvailableTimeEnd("17:00");
            doctor.setIsActive(true);
            doctorRepository.save(doctor);
            logger.info("Default doctor user created");
        }

        // Create Patient
        if (!userRepository.existsByUsername("patient1")) {
            Patient patient = new Patient();
            patient.setUsername("patient1");
            patient.setPassword(passwordEncoder.encode("patient123"));
            patient.setEmail("patient@hospital.com");
            patient.setPhoneNumber("5555555555");
            patient.setRole("PATIENT");
            patient.setFullName("John Doe");
            patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
            patient.setGender("Male");
            patient.setBloodGroup("O+");
            patient.setAddress("123 Main Street, City");
            patient.setEmergencyContact("9999999999");
            patient.setEmergencyContactName("Jane Doe");
            patient.setIsActive(true);
            patientRepository.save(patient);
            logger.info("Default patient user created");
        }
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
