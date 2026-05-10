package com.hospital.repository.mysql;

import com.hospital.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<String> findDistinctCategoryBy();
    
    @Query("SELECT i FROM InventoryItem i WHERE i.currentStock <= i.minThreshold")
    List<InventoryItem> findLowStockItems();
}
