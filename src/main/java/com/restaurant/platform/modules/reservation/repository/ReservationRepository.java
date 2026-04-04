package com.restaurant.platform.modules.reservation.repository;

import com.restaurant.platform.modules.reservation.entity.Reservation;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.table.entity.Table;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

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


}