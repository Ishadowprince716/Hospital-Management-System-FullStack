package com.hospital.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientDTO {
    private String name;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContact;
    private String emergencyContactName;
    private String insuranceProvider;
    private String insuranceNumber;
    private String allergies;
    private String currentMedications;
}
