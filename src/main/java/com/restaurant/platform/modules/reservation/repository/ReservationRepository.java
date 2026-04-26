package com.restaurant.platform.modules.reservation.repository;

import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.table.entity.Table;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
    FROM Reservation r
    WHERE r.table = :table
    AND r.reservationTime BETWEEN :start AND :end
    AND r.status IN :statuses
    """)
    boolean existsByTableAndReservationTimeBetweenAndStatusInWithLock(
            @Param("table") Table table,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("statuses") List<ReservationStatus> statuses
    );

    boolean existsByTableAndReservationTimeBetweenAndStatusIn(
            Table table,
            LocalDateTime start,
            LocalDateTime end,
            List<ReservationStatus> statuses
    );

    Page<Reservation> findByCustomerNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Reservation> findByPhoneContaining(String phone, Pageable pageable);

    long count();
    Long countByStatus(ReservationStatus status);
    
    List<Reservation> findByStatusIn(List<ReservationStatus> statuses);

    @Query("""
SELECT COUNT(r)
FROM Reservation r
""")
    Long countAll();

    @Query("""
SELECT COUNT(r)
FROM Reservation r
WHERE r.status = 'NO_SHOW'
""")
    Long countNoShow();

    Page<Reservation> findByUserId(UUID userId, Pageable pageable);

    List<Reservation> findByUserId(UUID userId);

    @Modifying
    @Query(value = "DELETE FROM reservations", nativeQuery = true)
    void deleteAllNative();

}