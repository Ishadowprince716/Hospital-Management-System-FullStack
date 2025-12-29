package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.MedicalRecord;
import com.hospital.repository.mysql.AppointmentRepository;
import com.hospital.repository.mysql.MedicalRecordRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final BillService billService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            BillService billService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.billService = billService;
    }

    @Transactional
    public MedicalRecord createMedicalRecord(@org.springframework.lang.NonNull Long appointmentId, String diagnosis,
            String prescription,
            String notes, String treatmentPlan) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (medicalRecordRepository.findByAppointment(appointment).isPresent()) {
            throw new RuntimeException("Medical record already exists for this appointment");
        }

        MedicalRecord record = new MedicalRecord();
        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());
        record.setDiagnosis(diagnosis);
        record.setPrescription(prescription);
        record.setNotes(notes);
        record.setTreatmentPlan(treatmentPlan);

        // Auto-complete appointment
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);

        // Auto-generate Bill
        billService.createBill(appointment);

        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getPatientMedicalRecords(@org.springframework.lang.NonNull Long patientId) {
        return medicalRecordRepository.findByPatientOrderByCreatedAtDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new RuntimeException("Patient not found")));
    }

    public MedicalRecord getRecordByAppointment(@org.springframework.lang.NonNull Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return medicalRecordRepository.findByAppointment(appointment)
                .orElse(null);
    }
}
