package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.hospital.repository.mysql")
@EnableMongoRepositories(basePackages = "com.hospital.repository.mongodb")
public class HospitalManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementApplication.class, args);
        System.out.println("🏥 Hospital Management System Started Successfully!");
        System.out.println("📍 Backend API: http://localhost:8080/api");
    }
}
