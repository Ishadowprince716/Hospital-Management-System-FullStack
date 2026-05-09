package com.hospital.repository.mysql;

import com.hospital.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Override
    @EntityGraph(attributePaths = {"user"})
    Optional<Notification> findById(Long id);

    @EntityGraph(attributePaths = {"user"})
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);

    Long countByUserIdAndIsRead(Long userId, Boolean isRead);
}
