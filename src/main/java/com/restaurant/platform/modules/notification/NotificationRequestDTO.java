package com.restaurant.platform.modules.notification;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationRequestDTO {
    private NotificationType type;
    private String title;
    private String message;
    private String content;
    private UUID userId;
    private NotificationChannel notificationChannel;
}
