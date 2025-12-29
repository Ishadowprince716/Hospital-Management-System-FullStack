package com.hospital.controller;

import com.hospital.model.*;
import com.hospital.repository.mysql.*;
import com.hospital.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabOrderRepository labOrderRepository;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            VitalSignsRepository vitalSignsRepository,
            AllergyRepository allergyRepository,
            PrescriptionRepository prescriptionRepository,
            LabOrderRepository labOrderRepository,
            UserRepository userRepository) {
        this.adminService = adminService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.vitalSignsRepository = vitalSignsRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;

        this.labOrderRepository = labOrderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @PostMapping("/init-sample-data")
    public ResponseEntity<Map<String, String>> initializeSampleData() {
        try {
            // Get all patients and first doctor
            List<Patient> patients = patientRepository.findAll();
            List<Doctor> doctors = doctorRepository.findAll();

            if (patients.isEmpty() || doctors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "No patients or doctors found in database"));
            }

            Doctor doctor = doctors.get(0);
            Random random = new Random();

            // Create vital signs for each patient
            for (Patient patient : patients) {
                for (int i = 0; i < 5; i++) {
                    VitalSigns vitals = new VitalSigns();
                    vitals.setPatient(patient);
                    int systolic = 110 + random.nextInt(30);
                    int diastolic = 70 + random.nextInt(20);
                    vitals.setBloodPressure(systolic + "/" + diastolic);
                    vitals.setPulse(60 + random.nextInt(40));
                    vitals.setTemperature(java.math.BigDecimal.valueOf(36.5 + random.nextDouble() * 1.5));
                    vitals.setOxygenSaturation(95 + random.nextInt(5));
                    vitals.setWeight(java.math.BigDecimal.valueOf(50.0 + random.nextDouble() * 50));
                    vitals.setHeight(java.math.BigDecimal.valueOf(150.0 + random.nextDouble() * 40));
                    vitalSignsRepository.save(vitals);
                }
            }

            // Create allergies
            String[] allergens = { "Penicillin", "Peanuts", "Latex", "Aspirin", "Shellfish" };
            String[] reactions = { "Rash", "Anaphylaxis", "Hives", "Swelling", "Difficulty breathing" };

            for (int i = 0; i < Math.min(patients.size(), allergens.length); i++) {
                Allergy allergy = new Allergy();
                allergy.setPatient(patients.get(i));
                allergy.setAllergen(allergens[i]);
                allergy.setAllergyType("DRUG");
                allergy.setSeverity("MODERATE");
                allergy.setReaction(reactions[i]);
                allergy.setIsActive(true);
                allergyRepository.save(allergy);
            }

            // Create prescriptions
            for (int i = 0; i < Math.min(patients.size(), 3); i++) {
                Prescription prescription = new Prescription();
                prescription.setPatient(patients.get(i));
                prescription.setDoctor(doctor);
                prescription.setDiagnosis("Common Cold");
                prescription.setStatus("ACTIVE");

                List<PrescriptionItem> items = new ArrayList<>();
                PrescriptionItem item = new PrescriptionItem();
                item.setMedicationName("Paracetamol");
                item.setDosage("500mg");
                item.setFrequency("Twice daily");
                item.setDuration("5 days");
                item.setRoute("Oral");
                item.setInstructions("Take after meals");
                item.setPrescription(prescription);
                items.add(item);

                prescription.setItems(items);
                prescriptionRepository.save(prescription);
            }

            // Create lab orders
            String[] testTypes = { "Blood Test", "X-Ray", "CT Scan", "MRI", "Ultrasound" };

            for (int i = 0; i < Math.min(patients.size(), testTypes.length); i++) {
                LabOrder labOrder = new LabOrder();
                labOrder.setPatient(patients.get(i));
                labOrder.setDoctor(doctor);
                labOrder.setTestType(testTypes[i]);
                labOrder.setPriority("ROUTINE");
                labOrder.setStatus("PENDING");
                labOrderRepository.save(labOrder);
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Sample data initialized successfully",
                    "patientsProcessed", String.valueOf(patients.size())));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "Failed to initialize sample data: " + e.getMessage()));
        }
    }
}
