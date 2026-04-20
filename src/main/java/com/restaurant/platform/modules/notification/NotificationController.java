package com.restaurant.platform.modules.notification;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationListDTO> getNotifications(
            Pageable pageable,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        log.info("Fetching notifications for user: {}", userId);

        NotificationListDTO result = notificationService.getNotificationsByUserId(userId, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationListDTO> getUnreadNotifications(
            Pageable pageable,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        log.info("Fetching unread notifications for user: {}", userId);

        NotificationListDTO result = notificationService.getUnreadNotifications(userId, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Long> getUnreadCount(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        long count = notificationService.getUnreadNotificationCount(userId);
        return ApiResponse.success(count);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationResponseDTO> getNotificationById(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Fetching notification: {}", id);

        NotificationResponseDTO notification = notificationService.getNotificationById(id);
        verifyNotificationOwnership(notification.getUserId(), authentication);

        return ApiResponse.success(notification);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<NotificationResponseDTO> createNotification(
            @Valid @RequestBody NotificationRequestDTO request) {
        log.info("Creating notification for user: {}", request.getUserId());

        NotificationResponseDTO notification = notificationService.createNotification(request);
        return ApiResponse.success("Notification created successfully", notification);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAsRead(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Marking notification as read: {}", id);

        NotificationResponseDTO notification = notificationService.getNotificationById(id);
        verifyNotificationOwnership(notification.getUserId(), authentication);

        notificationService.markAsRead(id);
        return ApiResponse.successMessage("Notification marked as read");
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAllAsRead(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        log.info("Marking all notifications as read for user: {}", userId);

        notificationService.markAllAsRead(userId);
        return ApiResponse.successMessage("All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> deleteNotification(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Deleting notification: {}", id);

        NotificationResponseDTO notification = notificationService.getNotificationById(id);
        verifyNotificationOwnership(notification.getUserId(), authentication);

        notificationService.deleteNotification(id);
        return ApiResponse.successMessage("Notification deleted successfully");
    }

    private UUID extractUserId(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email))
                .getId();
    }

    private void verifyNotificationOwnership(UUID notificationUserId, Authentication authentication) {
        UUID currentUserId = extractUserId(authentication);
        if (!notificationUserId.equals(currentUserId) && !hasAdminRole(authentication)) {
            throw new IllegalArgumentException("Unauthorized access to this notification");
        }
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
