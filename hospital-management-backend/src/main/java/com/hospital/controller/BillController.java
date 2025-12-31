package com.hospital.controller;

import com.hospital.model.Bill;
import com.hospital.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Bill>> getPatientBills(@PathVariable Long patientId) {
        return ResponseEntity.ok(billService.getPatientBills(patientId));
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> recordPayment(@PathVariable Long id, @RequestBody Map<String, Object> paymentRequest) {
        try {
            Double amount = Double.parseDouble(paymentRequest.get("amount").toString());
            String method = (String) paymentRequest.get("paymentMethod");
            String notes = (String) paymentRequest.get("notes");

            Bill bill = billService.recordPayment(id, amount, method, notes);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBill(@RequestBody Map<String, Object> billRequest) {
        try {
            Long patientId = Long.parseLong(billRequest.get("patientId").toString());

            Bill bill = new Bill();
            bill.setAmount(Double.parseDouble(billRequest.get("totalAmount").toString()));

            if (billRequest.get("paidAmount") != null) {
                bill.setPaidAmount(Double.parseDouble(billRequest.get("paidAmount").toString()));
            }

            bill.setPaymentMethod((String) billRequest.get("paymentMethod"));
            bill.setStatus((String) billRequest.get("paymentStatus"));
            bill.setNotes((String) billRequest.get("notes"));

            if (billRequest.get("billDate") != null) {
                bill.setBillDate(java.time.LocalDate.parse((String) billRequest.get("billDate")));
            }

            if (billRequest.get("dueDate") != null) {
                bill.setDueDate(java.time.LocalDate.parse((String) billRequest.get("dueDate")));
            }

            // Process items
            List<Map<String, Object>> items = (List<Map<String, Object>>) billRequest.get("items");
            if (items != null) {
                for (Map<String, Object> itemMap : items) {
                    com.hospital.model.BillItem item = new com.hospital.model.BillItem();
                    item.setDescription((String) itemMap.get("description"));
                    item.setQuantity(Integer.parseInt(itemMap.get("quantity").toString()));
                    item.setAmount(Double.parseDouble(itemMap.get("amount").toString()));
                    bill.addItem(item);
                }
            }

            Bill savedBill = billService.createInvoice(bill, patientId);
            return ResponseEntity.ok(savedBill);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create invoice: " + e.getMessage()));
        }
    }
}
