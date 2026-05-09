package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.BillRequestDTO;
import com.hospital.model.Bill;
import com.hospital.model.BillItem;
import com.hospital.service.BillService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/bills", "/api/v1/bills"})
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<Bill>>> getPatientBills(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "generatedAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(billService.getPatientBills(patientId, pageable)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Bill>>> getAllBills(
            @PageableDefault(size = 10, sort = "generatedAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(billService.getAllBills(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Bill>> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billService.getBillById(id)));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<Bill>> recordPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentRequest) {
        Double amount = Double.parseDouble(paymentRequest.get("amount").toString());
        String method = (String) paymentRequest.get("paymentMethod");
        String notes = (String) paymentRequest.get("notes");

        Bill bill = billService.recordPayment(id, amount, method, notes);
        return ResponseEntity.ok(ApiResponse.success(bill, "Payment recorded successfully"));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Bill>> payBill(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentRequest) {
        return recordPayment(id, paymentRequest);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Bill>> createBill(@Valid @RequestBody BillRequestDTO billRequest) {
        Bill bill = new Bill();
        bill.setAmount(billRequest.getTotalAmount());
        bill.setPaidAmount(billRequest.getPaidAmount() != null ? billRequest.getPaidAmount() : 0.0);
        bill.setPaymentMethod(billRequest.getPaymentMethod());
        bill.setStatus(billRequest.getPaymentStatus());
        bill.setNotes(billRequest.getNotes());
        bill.setBillDate(billRequest.getBillDate());
        bill.setDueDate(billRequest.getDueDate());

        if (billRequest.getItems() != null) {
            bill.setItems(billRequest.getItems().stream().map(itemDto -> {
                BillItem item = new BillItem();
                item.setDescription(itemDto.getDescription());
                item.setQuantity(itemDto.getQuantity());
                item.setAmount(itemDto.getAmount());
                item.setBill(bill);
                return item;
            }).collect(Collectors.toList()));
        }

        Bill savedBill = billService.createInvoice(bill, billRequest.getPatientId());
        return ResponseEntity.status(201).body(ApiResponse.success(savedBill, "Bill created successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Bill deleted successfully"));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkBillExists(@PathVariable Long id) {
        billService.getBillById(id);
        return ResponseEntity.ok().build();
    }
}
