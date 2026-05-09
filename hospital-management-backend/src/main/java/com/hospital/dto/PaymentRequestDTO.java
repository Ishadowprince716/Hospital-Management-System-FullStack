package com.hospital.dto;

public class PaymentRequestDTO {
    private Long billId;
    private Double amount;
    private String paymentMethod; // e.g., 'card'

    // Constructors
    public PaymentRequestDTO() {
    }

    public PaymentRequestDTO(Long billId, Double amount, String paymentMethod) {
        this.billId = billId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
