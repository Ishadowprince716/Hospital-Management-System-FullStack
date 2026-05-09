package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Notification;
import com.hospital.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Get all notifications for a user with pagination
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Notification>>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Notification marked as read"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Notification>> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotificationById(id)));
    }

    /**
     * Mark all notifications as read for a user
     */
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead(@PathVariable Long userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("message", "All notifications marked as read", "count", count)
        ));
    }

    /**
     * Create a new notification
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            String type = (String) request.get("type");

            Notification notification = notificationService.createNotification(userId, title, message, type);
            return ResponseEntity.status(201).body(ApiResponse.success(notification, "Notification created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create notification: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkNotificationExists(@PathVariable Long id) {
        notificationService.getNotificationById(id);
        return ResponseEntity.ok().build();
    }
}
