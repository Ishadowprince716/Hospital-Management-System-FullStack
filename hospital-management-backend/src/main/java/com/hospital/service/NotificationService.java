package com.hospital.service;

import com.hospital.model.Notification;
import com.hospital.model.User;
import com.hospital.repository.mysql.NotificationRepository;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                             UserRepository userRepository,
                             SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
        return notifications.size();
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        
        // Push live notification via WebSocket
        sendPrivateNotification(user.getUsername(), title, message, type);
        
        return saved;
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notificationRepository.delete(notification);
    }

    public void sendGlobalNotification(String title, String message, String type) {
        Map<String, String> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("message", message);
        payload.put("type", type);
        payload.put("timestamp", String.valueOf(System.currentTimeMillis()));

        messagingTemplate.convertAndSend("/topic/notifications", payload);
    }

    public void sendPrivateNotification(String username, String title, String message, String type) {
        Map<String, String> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("message", message);
        payload.put("type", type);
        payload.put("timestamp", String.valueOf(System.currentTimeMillis()));

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", payload);
    }

    public void sendTelehealthCallNotification(Map<String, String> payload) {
        payload.putIfAbsent("timestamp", String.valueOf(System.currentTimeMillis()));
        payload.putIfAbsent("type", "TELEHEALTH_CALL");
        messagingTemplate.convertAndSend("/topic/telehealth", payload);
    }
}
