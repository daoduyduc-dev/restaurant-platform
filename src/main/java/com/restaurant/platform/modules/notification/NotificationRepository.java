package com.restaurant.platform.modules.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {

    Page<NotificationEntity> findByUserId(UUID userId, Pageable pageable);

    List<NotificationEntity> findByUserIdAndIsReadFalse(UUID userId);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") UUID userId);

    @Query("SELECT n FROM NotificationEntity n WHERE n.user.id = :userId AND n.createdDate BETWEEN :startDate AND :endDate ORDER BY n.createdDate DESC")
    List<NotificationEntity> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT n FROM NotificationEntity n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdDate DESC")
    Page<NotificationEntity> findByUserIdAndType(
            @Param("userId") UUID userId,
            @Param("type") NotificationType type,
            Pageable pageable
    );

    void deleteByUserId(UUID userId);
}
