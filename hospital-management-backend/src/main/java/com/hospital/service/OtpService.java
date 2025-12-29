package com.hospital.service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Store OTPs in memory: Email -> OTP
    // In production, use Redis.
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // For expiration checks (simple version)
    // Email -> Expiration Time (timestamp)
    private final Map<String, Long> otpExpiration = new ConcurrentHashMap<>();

    private static final long OTP_VALID_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOtp(String email) {
        // Generate 6-digit OTP
        int otpValue = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(otpValue);

        otpStorage.put(email, otp);
        otpExpiration.put(email, System.currentTimeMillis() + OTP_VALID_DURATION_MS);

        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) {
            return false;
        }

        Long expirationTime = otpExpiration.get(email);
        if (expirationTime == null || System.currentTimeMillis() > expirationTime) {
            otpStorage.remove(email);
            otpExpiration.remove(email);
            return false;
        }

        String storedOtp = otpStorage.get(email);
        if (storedOtp.equals(otp)) {
            // Clear OTP after successful use
            otpStorage.remove(email);
            otpExpiration.remove(email);
            return true;
        }

        return false;
    }
}
