package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.SupportTicketDTO;
import com.hospital.service.SupportTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support-tickets")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupportTicketDTO>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getAllTickets()));
    }

    @GetMapping("/user/{requesterId}")
    public ResponseEntity<ApiResponse<List<SupportTicketDTO>>> getUserTickets(@PathVariable Long requesterId) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getUserTickets(requesterId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.getStats()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupportTicketDTO>> createTicket(@RequestBody SupportTicketDTO request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.success(supportTicketService.createTicket(request), "Support ticket created"));
    }

    @PatchMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<SupportTicketDTO>> updateTicket(
            @PathVariable Long ticketId,
            @RequestBody SupportTicketDTO request) {
        return ResponseEntity.ok(ApiResponse.success(supportTicketService.updateTicket(ticketId, request), "Support ticket updated"));
    }
}
