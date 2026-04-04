package com.restaurant.platform.modules.notification;

import com.restaurant.platform.common.EmailService;
import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;

    @Override
    public NotificationResponseDTO createNotification(NotificationRequestDTO request) {
        log.info("Creating notification for user: {}", request.getUserId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        NotificationEntity notification = NotificationEntity.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .content(request.getContent())
                .notificationChannel(request.getNotificationChannel() != null 
                    ? request.getNotificationChannel() 
                    : NotificationChannel.IN_APP)
                .isRead(false)
                .build();

        NotificationEntity saved = notificationRepository.save(notification);
        
        sendNotification(request);
        
        log.info("Notification created successfully with id: {}", saved.getId());
        return notificationMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationListDTO getNotificationsByUserId(UUID userId, Pageable pageable) {
        log.info("Fetching notifications for user: {}", userId);

        Page<NotificationEntity> page = notificationRepository.findByUserId(userId, pageable);
        long unreadCount = notificationRepository.countUnreadByUserId(userId);

        List<NotificationResponseDTO> dtos = notificationMapper.toDTOList(page.getContent());

        return new NotificationListDTO(
                dtos,
                (int) page.getTotalElements(),
                (int) unreadCount,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                page.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationListDTO getUnreadNotifications(UUID userId, Pageable pageable) {
        log.info("Fetching unread notifications for user: {}", userId);

        List<NotificationEntity> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        
        int totalUnread = unreadNotifications.size();
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), unreadNotifications.size());
        
        List<NotificationEntity> paged = unreadNotifications.subList(start, end);
        List<NotificationResponseDTO> dtos = notificationMapper.toDTOList(paged);

        return new NotificationListDTO(
                dtos,
                totalUnread,
                totalUnread,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                (totalUnread + pageable.getPageSize() - 1) / pageable.getPageSize()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponseDTO getNotificationById(UUID id) {
        log.info("Fetching notification: {}", id);

        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOTIFICATION_NOT_FOUND, "Notification not found"));

        return notificationMapper.toDTO(notification);
    }

    @Override
    public void markAsRead(UUID notificationId) {
        log.info("Marking notification as read: {}", notificationId);

        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOTIFICATION_NOT_FOUND, "Notification not found"));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);

        List<NotificationEntity> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public void deleteNotification(UUID id) {
        log.info("Deleting notification: {}", id);

        notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOTIFICATION_NOT_FOUND, "Notification not found"));

        notificationRepository.deleteById(id);
    }

    @Override
    public void deleteAllByUserId(UUID userId) {
        log.info("Deleting all notifications for user: {}", userId);
        notificationRepository.deleteByUserId(userId);
    }

    @Override
    public void sendNotification(NotificationRequestDTO request) {
        if (request.getNotificationChannel() == null) {
            return;
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND, "User not found"));

        NotificationChannel channel = request.getNotificationChannel();
        
        if (channel == NotificationChannel.EMAIL || channel == NotificationChannel.BOTH) {
            try {
                sendEmailNotification(user, request);
                log.info("Email notification sent to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send email notification to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    private void sendEmailNotification(User user, NotificationRequestDTO request) {
        String subject = request.getTitle();
        String body = request.getMessage();

        switch (request.getType()) {
            case PASSWORD_RESET:
                emailService.sendPasswordResetEmail(user.getEmail(), request.getContent());
                break;
            case PAYMENT_SUCCESS:
                emailService.sendPaymentConfirmationEmail(user.getEmail(), request.getContent(), request.getMessage());
                break;
            default:
                log.debug("No specific email handler for notification type: {}", request.getType());
        }
    }
}
