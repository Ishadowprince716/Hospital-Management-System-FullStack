package com.hospital.service;

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
    public Bill createInvoice(Bill invoiceData, Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        invoiceData.setPatient(patient);
        invoiceData.setGeneratedAt(LocalDateTime.now());

        // Calculate status based on amounts
        if (invoiceData.getPaidAmount() >= invoiceData.getAmount()) {
            invoiceData.setStatus("PAID");
            invoiceData.setBalanceAmount(0.0);
            invoiceData.setPaidAt(LocalDateTime.now());
        } else if (invoiceData.getPaidAmount() > 0) {
            invoiceData.setStatus("PARTIAL");
            invoiceData.setBalanceAmount(invoiceData.getAmount() - invoiceData.getPaidAmount());
        } else {
            invoiceData.setStatus("PENDING");
            invoiceData.setBalanceAmount(invoiceData.getAmount());
        }

        // Link items
        if (invoiceData.getItems() != null) {
            for (com.hospital.model.BillItem item : invoiceData.getItems()) {
                item.setBill(invoiceData);
            }
        }

        return billRepository.save(invoiceData);
    }

    @Transactional
    public Bill recordPayment(Long billId, Double amount, String paymentMethod, String notes) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if ("PAID".equals(bill.getStatus())) {
            throw new RuntimeException("Bill is already fully paid");
        }

        double currentPaid = bill.getPaidAmount() != null ? bill.getPaidAmount() : 0.0;
        double newPaid = currentPaid + amount;

        // Simple validation to prevent overpayment logic errors
        if (newPaid > bill.getAmount() + 0.1) { // 0.1 tolerance
            throw new RuntimeException(
                    "Payment amount " + amount + " exceeds remaining balance " + bill.getBalanceAmount());
        }

        bill.setPaidAmount(newPaid);
        bill.setBalanceAmount(bill.getAmount() - newPaid);
        bill.setPaymentMethod(paymentMethod);

        // Update notes if provided
        if (notes != null && !notes.isEmpty()) {
            String currentNotes = bill.getNotes() != null ? bill.getNotes() : "";
            bill.setNotes(
                    currentNotes + (currentNotes.isEmpty() ? "" : " | ") + "Payment: " + amount + " (" + notes + ")");
        }

        if (bill.getBalanceAmount() <= 0.01) {
            bill.setStatus("PAID");
            bill.setPaidAt(LocalDateTime.now());
            bill.setBalanceAmount(0.0);

            if (bill.getAppointment() != null) {
                bill.getAppointment().setPaymentStatus("PAID");
            }
        } else {
            bill.setStatus("PARTIAL");
        }

        return billRepository.save(bill);
    }

    public List<Bill> getPatientBills(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return billRepository.findByPatientOrderByGeneratedAtDesc(patient);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
}
