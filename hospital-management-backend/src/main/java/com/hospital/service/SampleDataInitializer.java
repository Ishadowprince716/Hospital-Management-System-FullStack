package com.hospital.service;

import com.hospital.model.*;
import com.hospital.repository.mysql.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class SampleDataInitializer implements CommandLineRunner {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabOrderRepository labOrderRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;

    public SampleDataInitializer(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            VitalSignsRepository vitalSignsRepository,
            AllergyRepository allergyRepository,
            PrescriptionRepository prescriptionRepository,
            LabOrderRepository labOrderRepository,
            AppointmentRepository appointmentRepository,
            AuthService authService,
            BillRepository billRepository,
            PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.vitalSignsRepository = vitalSignsRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labOrderRepository = labOrderRepository;
        this.appointmentRepository = appointmentRepository;
        this.authService = authService;
        this.billRepository = billRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure default users exist
        authService.initializeDefaultUsers();

        // ALWAYS run specific data updates (it has its own internal checks for
        // duplicates)
        addSpecificSampleData();

        // Check if sample data already exists - logic modified to allow specific
        // updates
        if (vitalSignsRepository.count() > 0 && appointmentRepository.count() > 5) {
            System.out.println("Sample data already exists. Skipping initialization.");
            return;
        }

        System.out.println("Initializing sample data...");

        // Get existing doctor
        List<Doctor> doctors = doctorRepository.findAll();
        if (doctors.isEmpty()) {
            System.out.println("✗ No doctors found. Skipping sample data initialization.");
            return;
        }
        Doctor doctor = doctors.get(0);

        // Get existing patients
        List<Patient> patients = patientRepository.findAll();
        if (patients.isEmpty()) {
            System.out.println("No patients found. Skipping sample data initialization.");
            return;
        }

        // Add sample data for each patient
        for (int i = 0; i < Math.min(patients.size(), 5); i++) {
            Patient patient = patients.get(i);

            // Add vital signs
            addVitalSigns(patient);

            // Add allergies
            addAllergies(patient);

            // Add prescriptions
            addPrescriptions(patient, doctor);

            // Add lab orders
            addLabOrders(patient, doctor);

            // Add appointments
            addAppointments(patient, doctor);
        }

        System.out.println("Sample data initialization completed!");
    }

    private void addVitalSigns(Patient patient) {
        // Add 3 vital signs records
        for (int i = 0; i < 3; i++) {
            VitalSigns vitals = new VitalSigns();
            vitals.setPatient(patient);
            vitals.setBloodPressure((120 + i * 5) + "/" + (80 + i * 3));
            vitals.setPulse(72 + i * 2);
            vitals.setTemperature(new BigDecimal("98." + (4 + i)));
            vitals.setRespiratoryRate(16 + i);
            vitals.setOxygenSaturation(98 - i);
            vitals.setWeight(new BigDecimal("70." + (5 + i * 2)));
            vitals.setHeight(new BigDecimal("170.0"));

            // Calculate BMI
            BigDecimal heightInMeters = vitals.getHeight().divide(new BigDecimal("100"));
            BigDecimal bmi = vitals.getWeight().divide(
                    heightInMeters.multiply(heightInMeters), 2, RoundingMode.HALF_UP);
            vitals.setBmi(bmi);

            vitalSignsRepository.save(vitals);
        }
    }

    private void addAllergies(Patient patient) {
        // Add 2 allergies
        String[][] allergyData = {
                { "DRUG", "Penicillin", "MODERATE", "Skin rash and itching" },
                { "FOOD", "Peanuts", "SEVERE", "Anaphylaxis, difficulty breathing" }
        };

        for (String[] data : allergyData) {
            Allergy allergy = new Allergy();
            allergy.setPatient(patient);
            allergy.setAllergyType(data[0]);
            allergy.setAllergen(data[1]);
            allergy.setSeverity(data[2]);
            allergy.setReaction(data[3]);
            allergy.setIsActive(true);
            allergyRepository.save(allergy);
        }
    }

    private void addPrescriptions(Patient patient, Doctor doctor) {
        // Add 2 prescriptions
        String[][] prescriptionData = {
                { "Viral Fever", "ACTIVE" },
                { "Seasonal Allergies", "COMPLETED" }
        };

        for (String[] data : prescriptionData) {
            Prescription prescription = new Prescription();
            prescription.setPatient(patient);
            prescription.setDoctor(doctor);
            prescription.setDiagnosis(data[0]);
            prescription.setStatus(data[1]);
            prescription.setNotes("Follow-up in 1 week");

            Prescription saved = prescriptionRepository.save(prescription);

            // Add prescription items
            if (data[0].equals("Viral Fever")) {
                addPrescriptionItem(saved, "Paracetamol", "500mg", "Three times daily", "5 days", "ORAL",
                        "Take after meals", 15);
                addPrescriptionItem(saved, "Vitamin C", "1000mg", "Once daily", "7 days", "ORAL", "Take with water", 7);
            } else {
                addPrescriptionItem(saved, "Cetirizine", "10mg", "Once daily", "10 days", "ORAL", "Take at bedtime",
                        10);
            }
        }
    }

    private void addPrescriptionItem(Prescription prescription, String name, String dosage,
            String frequency, String duration, String route,
            String instructions, int quantity) {
        PrescriptionItem item = new PrescriptionItem();
        item.setPrescription(prescription);
        item.setMedicationName(name);
        item.setDosage(dosage);
        item.setFrequency(frequency);
        item.setDuration(duration);
        item.setRoute(route);
        item.setInstructions(instructions);
        item.setQuantity(quantity);

        prescription.addItem(item);
    }

    private void addLabOrders(Patient patient, Doctor doctor) {
        // Add 2 lab orders
        String[][] labData = {
                { "Blood Test", "Complete Blood Count (CBC)", "ROUTINE", "COMPLETED" },
                { "X-Ray", "Chest X-Ray", "URGENT", "PENDING" }
        };

        for (String[] data : labData) {
            LabOrder labOrder = new LabOrder();
            labOrder.setPatient(patient);
            labOrder.setDoctor(doctor);
            labOrder.setTestType(data[0]);
            labOrder.setTestName(data[1]);
            labOrder.setPriority(data[2]);
            labOrder.setStatus(data[3]);
            labOrder.setNotes("Standard procedure");

            if (data[3].equals("COMPLETED")) {
                labOrder.setResultDate(LocalDateTime.now().minusDays(2));
                labOrder.setResultSummary("All values within normal range");
            }

            labOrderRepository.save(labOrder);
        }
    }

    private void addAppointments(Patient patient, Doctor doctor) {
        // Today's Appointments
        createAppointment(patient, doctor, LocalDate.now(), LocalTime.of(9, 0), "SCHEDULED", "Routine Checkup");
        createAppointment(patient, doctor, LocalDate.now(), LocalTime.of(14, 30), "SCHEDULED", "Report Analysis");

        // Upcoming
        createAppointment(patient, doctor, LocalDate.now().plusDays(1), LocalTime.of(10, 0), "SCHEDULED", "Follow-up");
        createAppointment(patient, doctor, LocalDate.now().plusDays(2), LocalTime.of(11, 15), "SCHEDULED",
                "Flu Symptoms");

        // Past
        createAppointment(patient, doctor, LocalDate.now().minusDays(5), LocalTime.of(15, 0), "COMPLETED",
                "Initial Consultation");
        createAppointment(patient, doctor, LocalDate.now().minusDays(10), LocalTime.of(11, 0), "COMPLETED",
                "Blood Pressure Check");
    }

    private void createAppointment(Patient patient, Doctor doctor, LocalDate date, LocalTime time, String status,
            String reason) {
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setStatus(status);
        appointment.setReason(reason);
        appointment.setAppointmentType("CONSULTATION");
        appointment.setPaymentStatus("PENDING");
        appointment.setConsultationFee(500.0);
        appointmentRepository.save(appointment);
    }

    private void addSpecificSampleData() {
        try {
            // 1. Get or Create Doctor
            Doctor doctor = doctorRepository.findByUsername("doctor1").orElse(null);
            if (doctor != null) {
                doctor.setFullName("Dr. Rahul Singh Kushwaha");
                doctor.setDepartment("General Medicine");
                doctorRepository.save(doctor);
            }

            // 2. Setup Patients
            // Patient 1: Amit Verma (Update existing patient1)
            Patient amit = patientRepository.findByUsername("patient1").orElse(null);
            if (amit != null) {
                amit.setFullName("Amit Verma");
                amit.setDateOfBirth(LocalDate.now().minusYears(32)); // 32 years old
                amit.setGender("Male");
                amit.setBloodGroup("O+");
                patientRepository.save(amit);
            }

            // Patient 2: Neha Sharma (Create if missing)
            Patient neha = createPatientIfMissing("patient_neha", "Neha Sharma", 26, "Female", "A+");

            // Patient 3: Rohit Jain (Create if missing)
            Patient rohit = createPatientIfMissing("patient_rohit", "Rohit Jain", 45, "Male", "B+");

            // 3. Add Appointments (Ensuring data for TODAY)
            if (doctor != null) {
                // Check if appointments exist for today to avoid duplicates on restart
                long todayCount = appointmentRepository.countByDoctorAndAppointmentDate(doctor,
                        LocalDate.now());

                if (todayCount < 2) {
                    System.out.println("Adding fresh appointments for TODAY...");

                    if (amit != null) {
                        createAppointment(amit, doctor, LocalDate.now(), LocalTime.of(10, 0), "COMPLETED",
                                "Fever & Body Pain");
                        createAppointment(amit, doctor, LocalDate.now().minusDays(3), LocalTime.of(18, 0), "COMPLETED",
                                "Vitals Check");
                    }

                    if (neha != null) {
                        createAppointment(neha, doctor, LocalDate.now(), LocalTime.of(11, 30), "SCHEDULED",
                                "Stomach Pain Analysis");
                    }

                    if (rohit != null) {
                        createAppointment(rohit, doctor, LocalDate.now(), LocalTime.of(13, 0), "SCHEDULED",
                                "Diabetes Follow-up");
                        createAppointment(rohit, doctor, LocalDate.now().plusDays(2), LocalTime.of(9, 0), "SCHEDULED",
                                "Diet Consultation");
                    }
                }
            }

            // 4. Add Prescriptions
            if (doctor != null && amit != null) {
                Prescription rx = new Prescription();
                rx.setPatient(amit);
                rx.setDoctor(doctor);
                rx.setDiagnosis("Viral Fever");
                rx.setStatus("ACTIVE");
                rx.setNotes("Drink plenty of water");
                Prescription savedRx = prescriptionRepository.save(rx);

                addPrescriptionItem(savedRx, "Paracetamol", "650mg", "1-0-1", "3 days", "ORAL", "After food", 6);
                addPrescriptionItem(savedRx, "Azithromycin", "500mg", "1-0-0", "3 days", "ORAL", "Before food", 3);
            }

            // 5. Add Lab Orders
            if (doctor != null && neha != null) {
                LabOrder lab = new LabOrder();
                lab.setPatient(neha);
                lab.setDoctor(doctor);
                lab.setTestType("Blood Test");
                lab.setTestName("Complete Blood Count (CBC)");
                lab.setPriority("ROUTINE");
                lab.setStatus("PENDING");
                lab.setNotes("Check for infection");
                labOrderRepository.save(lab);
            }

            if (doctor != null && amit != null) {
                LabOrder lab = new LabOrder();
                lab.setPatient(amit);
                lab.setDoctor(doctor);
                lab.setTestType("Serology");
                lab.setTestName("Dengue NS1");
                lab.setPriority("URGENT");
                lab.setStatus("COMPLETED");
                lab.setResultDate(LocalDateTime.now().minusHours(2));
                lab.setResultSummary("Negative");
                lab.setNotes("Fever profile");
                labOrderRepository.save(lab);
            }

            // 6. Add Bills
            if (amit != null && billRepository.count() == 0) { // Simple check to avoid duplicates
                Bill bill = new Bill();
                bill.setPatient(amit);
                bill.setAmount(1200.0);
                bill.setStatus("UNPAID");
                bill.setGeneratedAt(LocalDateTime.now());
                billRepository.save(bill);
            }

        } catch (Exception e) {
            System.err.println("Error adding specific sample data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Patient createPatientIfMissing(String username, String fullName, int age, String gender,
            String bloodGroup) {
        if (patientRepository.existsByUsername(username)) {
            return patientRepository.findByUsername(username).orElse(null);
        }

        Patient patient = new Patient();
        patient.setUsername(username);
        patient.setPassword(passwordEncoder.encode("password")); // Default password
        patient.setEmail(username + "@hospital.com");
        patient.setRole("PATIENT");
        patient.setIsActive(true);
        patient.setFullName(fullName);
        patient.setDateOfBirth(LocalDate.now().minusYears(age));
        patient.setGender(gender);
        patient.setBloodGroup(bloodGroup);
        patient.setPhoneNumber("1234567890");
        patient.setAddress("Sample Address");

        return patientRepository.save(patient);
    }
}
