package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.InventoryItem;
import com.hospital.model.StockTransaction;
import com.hospital.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<StockTransaction>> adjustStock(
            @RequestParam Long itemId,
            @RequestParam Integer quantity,
            @RequestParam StockTransaction.TransactionType type,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjustStock(itemId, quantity, type, reason)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockItems()));
    }
}
