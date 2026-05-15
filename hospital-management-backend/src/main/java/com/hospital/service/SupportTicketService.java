package com.hospital.service;

import com.hospital.dto.SupportTicketDTO;
import com.hospital.model.SupportTicket;
import com.hospital.model.User;
import com.hospital.repository.mysql.SupportTicketRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    public SupportTicketService(SupportTicketRepository supportTicketRepository, UserRepository userRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.userRepository = userRepository;
    }

    public List<SupportTicketDTO> getAllTickets() {
        return supportTicketRepository.findAllByOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<SupportTicketDTO> getUserTickets(Long requesterId) {
        return supportTicketRepository.findByRequester_IdOrderByUpdatedAtDesc(requesterId).stream().map(this::toDto).toList();
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "open", supportTicketRepository.countByStatus("OPEN"),
                "inProgress", supportTicketRepository.countByStatus("IN_PROGRESS"),
                "waiting", supportTicketRepository.countByStatus("WAITING_ON_PATIENT"),
                "resolved", supportTicketRepository.countByStatus("RESOLVED")
        );
    }

    @Transactional
    public SupportTicketDTO createTicket(SupportTicketDTO request) {
        User requester = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setRequester(requester);
        ticket.setSubject(clean(request.getSubject(), "Support request"));
        ticket.setCategory(clean(request.getCategory(), "General"));
        ticket.setPriority(normalize(request.getPriority(), "MEDIUM"));
        ticket.setStatus("OPEN");
        ticket.setDescription(clean(request.getDescription(), "No details provided"));
        return toDto(supportTicketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketDTO updateTicket(Long ticketId, SupportTicketDTO request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found"));
        ticket.setStatus(normalize(request.getStatus(), ticket.getStatus()));
        ticket.setPriority(normalize(request.getPriority(), ticket.getPriority()));
        ticket.setAdminNote(request.getAdminNote());
        return toDto(ticket);
    }

    private String clean(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim();
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.trim().toUpperCase().replace(' ', '_');
    }

    private SupportTicketDTO toDto(SupportTicket ticket) {
        SupportTicketDTO dto = new SupportTicketDTO();
        dto.setId(ticket.getId());
        dto.setRequesterId(ticket.getRequester().getId());
        dto.setRequesterName(ticket.getRequester().getFullName() != null
                ? ticket.getRequester().getFullName()
                : ticket.getRequester().getUsername());
        dto.setRequesterRole(ticket.getRequester().getRole());
        dto.setSubject(ticket.getSubject());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setDescription(ticket.getDescription());
        dto.setAdminNote(ticket.getAdminNote());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }
}
