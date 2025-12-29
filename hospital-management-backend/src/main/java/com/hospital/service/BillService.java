package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Bill;
import com.hospital.model.Patient;
import com.hospital.repository.mysql.BillRepository;
import com.hospital.repository.mysql.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    public BillService(BillRepository billRepository, PatientRepository patientRepository) {
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public Bill createBill(Appointment appointment) {
        Bill bill = new Bill();
        bill.setAppointment(appointment);
        bill.setPatient(appointment.getPatient());

        // Use doctor's fee or default
        Double fee = appointment.getDoctor().getConsultationFee();
        if (fee == null)
            fee = 500.0; // Default Fee

        bill.setAmount(fee);
        bill.setStatus("PENDING");
        bill.setGeneratedAt(LocalDateTime.now());

        return billRepository.save(bill);
    }

    @Transactional
    public Bill payBill(Long billId, String paymentMethod) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if ("PAID".equals(bill.getStatus())) {
            throw new RuntimeException("Bill is already paid");
        }

        bill.setStatus("PAID");
        bill.setPaymentMethod(paymentMethod);
        bill.setPaidAt(LocalDateTime.now());
        bill.setTransactionId(UUID.randomUUID().toString()); // Mock Transaction ID

        // Update appointment payment status too
        if (bill.getAppointment() != null) {
            bill.getAppointment().setPaymentStatus("PAID");
        }

        return billRepository.save(bill);
    }

    public List<Bill> getPatientBills(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return billRepository.findByPatientOrderByGeneratedAtDesc(patient);
    }
}
