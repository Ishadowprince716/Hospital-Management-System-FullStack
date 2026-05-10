package com.hospital.service;

import com.hospital.model.Prescription;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.DoctorRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.PrescriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getPatientPrescriptions(Long patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getDoctorPrescriptions(Long doctorId, Pageable pageable) {
        return prescriptionRepository.findByDoctorId(doctorId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getAllPrescriptions(Pageable pageable) {
        return prescriptionRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with ID: " + id));
    }

    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        if (prescription.getPatient() == null || prescription.getPatient().getId() == null) {
            throw new RuntimeException("Patient is required");
        }
        if (prescription.getDoctor() == null || prescription.getDoctor().getId() == null) {
            throw new RuntimeException("Doctor is required");
        }

        Patient patient = patientRepository.findById(prescription.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(prescription.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        if (prescription.getItems() != null) {
            prescription.getItems().forEach(item -> item.setPrescription(prescription));
        }

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updatePrescriptionStatus(Long id, String status) {
        Prescription prescription = getPrescriptionById(id);
        prescription.setStatus(status);
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updatePrescriptionFull(Long id, Prescription updatedData) {
        Prescription existing = getPrescriptionById(id);
        existing.setDiagnosis(updatedData.getDiagnosis());
        existing.setNotes(updatedData.getNotes());
        existing.setStatus(updatedData.getStatus());
        existing.setFollowUpDate(updatedData.getFollowUpDate());
        return prescriptionRepository.save(existing);
    }

    @Transactional
    public void deletePrescription(Long id) {
        Prescription existing = getPrescriptionById(id);
        prescriptionRepository.delete(existing);
    }
}
