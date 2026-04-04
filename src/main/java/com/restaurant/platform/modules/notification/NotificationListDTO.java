package com.restaurant.platform.modules.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class NotificationListDTO {
    private List<NotificationResponseDTO> notifications;
    private int totalCount;
    private int unreadCount;
    private int page;
    private int pageSize;
    private int totalPages;
}
