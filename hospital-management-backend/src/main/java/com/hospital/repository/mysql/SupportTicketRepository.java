package com.hospital.repository.mysql;

import com.hospital.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByRequester_IdOrderByUpdatedAtDesc(Long requesterId);

    List<SupportTicket> findAllByOrderByUpdatedAtDesc();

    long countByStatus(String status);
}
