package com.restaurant.platform.modules.notification;

import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    NotificationResponseDTO createNotification(NotificationRequestDTO request);

    NotificationListDTO getNotificationsByUserId(UUID userId, Pageable pageable);

    NotificationListDTO getUnreadNotifications(UUID userId, Pageable pageable);

    long getUnreadNotificationCount(UUID userId);

    NotificationResponseDTO getNotificationById(UUID id);

    void markAsRead(UUID notificationId);

    void markAllAsRead(UUID userId);

    void deleteNotification(UUID id);

    void deleteAllByUserId(UUID userId);

    void sendNotification(NotificationRequestDTO request);
}
