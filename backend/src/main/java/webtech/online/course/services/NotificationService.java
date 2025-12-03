package webtech.online.course.services;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import webtech.online.course.models.Notification;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String title, String message, String linkUrl);

    List<Notification> getUserNotifications(Long userId, Pageable pageable);

    List<Notification> getUnreadNotifications(Long userId);

    List<Notification> getNextPageUserNotifications(Long userId, LocalDateTime lastCreatedAt, Long notifyId, Pageable pageable);

    Notification markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    Long getUnreadCount(Long userId);
}
