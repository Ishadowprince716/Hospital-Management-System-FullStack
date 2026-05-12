package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.cache.annotation.EnableCaching;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableCaching
@EntityScan(basePackages = "com.hospital.model")
@EnableJpaRepositories(basePackages = "com.hospital.repository.mysql")
public class HospitalManagementApplication {
    private static final Logger log = LoggerFactory.getLogger(HospitalManagementApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementApplication.class, args);
        log.info("Hospital Management System started successfully");
        log.info("Backend API is available at /api");
    }
}
