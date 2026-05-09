package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.PaymentRequestDTO;
import com.hospital.model.Bill;
import com.hospital.service.BillService;
import com.hospital.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/payments", "/api/v1/payments"})
@CrossOrigin(origins = "*")
public class PaymentController {

    private final BillService billService;
    private final StripeService stripeService;

    @Value("${STRIPE_PUBLISHABLE_KEY}")
    private String stripePublishableKey;

    public PaymentController(BillService billService, StripeService stripeService) {
        this.billService = billService;
        this.stripeService = stripeService;
    }

    @GetMapping("/config/stripe-key")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStripeKey() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("publishableKey", stripePublishableKey)));
    }

    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            Long billId = Long.parseLong(request.get("billId").toString());
            Double amount = Double.parseDouble(request.get("amount").toString());
            String description = (String) request.get("description");

            // Check if bill exists
            billService.getBillById(billId);

            PaymentIntent paymentIntent = stripeService.createPaymentIntent(amount.longValue(), "inr", description);

            return ResponseEntity.status(201).body(ApiResponse.success(
                Map.of("clientSecret", paymentIntent.getClientSecret())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment intent creation failed: " + e.getMessage()));
        }
    }

    @PostMapping("/confirm/{id}")
    public ResponseEntity<ApiResponse<Bill>> confirmPayment(@PathVariable Long id) {
        Bill bill = billService.recordPayment(id, null, "CARD", "Stripe payment confirmed");
        return ResponseEntity.ok(ApiResponse.success(bill, "Payment confirmed successfully"));
    }

    @PostMapping("/bills/{id}/payments")
    public ResponseEntity<ApiResponse<Bill>> payBill(@PathVariable Long id) {
        return confirmPayment(id);
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<Bill>> processPayment(@RequestBody PaymentRequestDTO request) {
        if (request.getBillId() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Bill ID is required"));
        }
        return confirmPayment(request.getBillId());
    }
}
