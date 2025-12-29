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

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payBill(@PathVariable Long id, @RequestParam(defaultValue = "CARD") String method) {
        try {
            Bill bill = billService.payBill(id, method);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
