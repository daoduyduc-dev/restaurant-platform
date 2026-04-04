package com.restaurant.platform.modules.notification;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationResponseDTO {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private String content;
    private Boolean isRead;
    private NotificationChannel notificationChannel;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
