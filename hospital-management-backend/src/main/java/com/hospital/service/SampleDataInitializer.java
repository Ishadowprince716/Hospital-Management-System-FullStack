package com.hospital.service;

import org.springframework.boot.CommandLineRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SampleDataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(SampleDataInitializer.class);

    private final AuthService authService;

    public SampleDataInitializer(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure default users exist (Only Admin, as Doctor/Patient creation was
        // removed)
        authService.initializeDefaultUsers();

        log.info("Sample data initialization is disabled. System will use only real user registration data.");
    }
}
