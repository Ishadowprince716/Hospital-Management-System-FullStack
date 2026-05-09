package com.hospital.service;

import com.hospital.model.InventoryItem;
import com.hospital.model.StockTransaction;
import com.hospital.repository.mysql.InventoryItemRepository;
import com.hospital.repository.mysql.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final NotificationService notificationService;

    public InventoryService(InventoryItemRepository inventoryItemRepository,
                            StockTransactionRepository stockTransactionRepository,
                            NotificationService notificationService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public StockTransaction adjustStock(Long itemId, Integer quantity, StockTransaction.TransactionType type, String reason) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (type == StockTransaction.TransactionType.OUT && item.getCurrentStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        int newStock = (type == StockTransaction.TransactionType.IN) 
                ? item.getCurrentStock() + quantity 
                : item.getCurrentStock() - quantity;

        item.setCurrentStock(newStock);
        inventoryItemRepository.save(item);

        StockTransaction transaction = StockTransaction.builder()
                .item(item)
                .quantity(quantity)
                .type(type)
                .reason(reason)
                .build();

        StockTransaction saved = stockTransactionRepository.save(transaction);

        // Check for low stock alert
        checkAndAlertLowStock(item);

        return saved;
    }

    public double calculateDailyUsageRate(Long itemId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<StockTransaction> recentOuts = stockTransactionRepository.findByItemIdAndTransactionDateAfter(itemId, thirtyDaysAgo)
                .stream()
                .filter(t -> t.getType() == StockTransaction.TransactionType.OUT)
                .toList();

        int totalOut = recentOuts.stream().mapToInt(StockTransaction::getQuantity).sum();
        return (double) totalOut / 30.0;
    }

    private void checkAndAlertLowStock(InventoryItem item) {
        double usageRate = calculateDailyUsageRate(item.getId());
        int leadTimeDays = item.getLeadTimeDays() != null ? item.getLeadTimeDays() : 7;
        
        // Safety Stock Formula: (Usage Rate * Lead Time) + Buffer
        double reorderPoint = (usageRate * leadTimeDays) + item.getMinThreshold();

        if (item.getCurrentStock() <= reorderPoint) {
            String message = String.format("CRITICAL: %s stock is low (%d left). Daily burn rate: %.2f. Auto-reorder recommended.", 
                    item.getName(), item.getCurrentStock(), usageRate);
            notificationService.sendGlobalNotification("INVENTORY_ALERT", message, "WARNING");
        }
    }

    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }
}
