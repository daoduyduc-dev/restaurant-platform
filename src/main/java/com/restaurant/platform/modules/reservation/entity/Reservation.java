package com.restaurant.platform.modules.reservation.entity;


import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@jakarta.persistence.Table(
        name = "reservations",
        indexes = {
                @Index(name = "idx_table_time", columnList = "table_id,reservation_time")
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE reservations SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Reservation extends SoftDeleteEntity {

    private String customerName;

    private String phone;

    private LocalDateTime reservationTime;

    private int numberOfGuests;

    @ManyToOne
    @JoinColumn(name = "table_id", nullable = false)
    private Table table;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String notes;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}