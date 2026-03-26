package com.restaurant.platform.modules.reservation.entity;


import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.reservation.enums.ReservationStatus;
import com.restaurant.platform.modules.table.entity.Table;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@jakarta.persistence.Table(
        name = "reservations",
        indexes = {
                @Index(name = "idx_table_time", columnList = "tableId,reservationTime")
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

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}