package webtech.online.course.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.services.NotificationService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<DefaultResponse> getUserNotifications(@PathVariable Long userId) {
        var notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", notifications));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<DefaultResponse> getUnreadNotifications(@PathVariable Long userId) {
        var notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", notifications));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<DefaultResponse> getUnreadCount(@PathVariable Long userId) {
        var count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", count));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<DefaultResponse> markAsRead(@PathVariable Long notificationId) {
        var notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "Marked as read", notification));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<DefaultResponse> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "All notifications marked as read"));
    }
}
