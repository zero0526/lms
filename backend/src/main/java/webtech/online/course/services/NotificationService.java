package webtech.online.course.services;

import webtech.online.course.models.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String title, String message, String linkUrl);

    List<Notification> getUserNotifications(Long userId);

    List<Notification> getUnreadNotifications(Long userId);

    Notification markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    Long getUnreadCount(Long userId);
}
