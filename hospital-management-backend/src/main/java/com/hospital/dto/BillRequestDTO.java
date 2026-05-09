package com.hospital.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.util.List;

@Data
public class BillRequestDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private Double totalAmount;

    private Double paidAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String notes;
    private LocalDate billDate;
    private LocalDate dueDate;
    private List<BillItemDTO> items;

    @Data
    public static class BillItemDTO {
        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        private Double amount;
    }
}
