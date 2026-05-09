package com.hospital.service;

import com.hospital.model.LabOrder;
import com.hospital.model.Patient;
import com.hospital.model.Doctor;
import com.hospital.repository.mysql.LabOrderRepository;
import com.hospital.repository.mysql.PatientRepository;
import com.hospital.repository.mysql.DoctorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public LabOrderService(LabOrderRepository labOrderRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.labOrderRepository = labOrderRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public Page<LabOrder> getDoctorLabOrders(Long doctorId, Pageable pageable) {
        return labOrderRepository.findByDoctorId(doctorId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<LabOrder> getPatientLabOrders(Long patientId, Pageable pageable) {
        return labOrderRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<LabOrder> getAllLabOrders(Pageable pageable) {
        return labOrderRepository.findAll(pageable);
    }

    @Transactional
    public LabOrder createLabOrder(LabOrder labOrder) {
        if (labOrder.getPatient() != null && labOrder.getPatient().getId() != null) {
            Patient patient = patientRepository.findById(labOrder.getPatient().getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            labOrder.setPatient(patient);
        }

        if (labOrder.getDoctor() != null && labOrder.getDoctor().getId() != null) {
            Doctor doctor = doctorRepository.findById(labOrder.getDoctor().getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            labOrder.setDoctor(doctor);
        }

        return labOrderRepository.save(labOrder);
    }

    @Transactional
    public LabOrder updateLabOrderStatus(Long id, String status) {
        LabOrder order = labOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab order not found"));
        order.setStatus(status);
        return labOrderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public LabOrder getLabOrderById(Long id) {
        return labOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab order not found with ID: " + id));
    }

    @Transactional
    public void deleteLabOrder(Long id) {
        LabOrder order = labOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab order not found with ID: " + id));
        labOrderRepository.delete(order);
    }
}
