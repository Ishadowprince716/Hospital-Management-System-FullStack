package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.CommandAlertDTO;
import com.hospital.service.CommandAlertService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/command-alerts")
public class CommandAlertController {
    private final CommandAlertService commandAlertService;

    public CommandAlertController(CommandAlertService commandAlertService) {
        this.commandAlertService = commandAlertService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommandAlertDTO>>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(commandAlertService.list(status), "Command alerts loaded"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> metrics() {
        return ResponseEntity.ok(ApiResponse.success(commandAlertService.metrics(), "Command alert metrics loaded"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommandAlertDTO>> create(@Valid @RequestBody CommandAlertDTO dto) {
        return ResponseEntity.status(201).body(ApiResponse.success(commandAlertService.create(dto), "Command alert created"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CommandAlertDTO>> updateStatus(@PathVariable Long id, @RequestBody CommandAlertDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(commandAlertService.updateStatus(id, dto), "Command alert updated"));
    }
}
