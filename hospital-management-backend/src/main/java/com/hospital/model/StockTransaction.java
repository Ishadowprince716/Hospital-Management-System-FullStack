package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;

@Data
@Entity
@Audited
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stock_transactions")
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // IN, OUT

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 1000)
    private String reason; // e.g., Patient Prescription, Supplier Purchase, Spillage

    @CreationTimestamp
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    public enum TransactionType {
        IN, OUT
    }
}
