package com.hospital.repository.mysql;

import com.hospital.model.CommandAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandAlertRepository extends JpaRepository<CommandAlert, Long> {
    List<CommandAlert> findByStatusNotOrderByCreatedAtDesc(String status);
    List<CommandAlert> findTop50ByOrderByCreatedAtDesc();
}
