package com.restaurant.platform.modules.table.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.table.enums.TableStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@jakarta.persistence.Table(name = "tables")
@Getter
@SQLDelete(sql = "UPDATE tables SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Table extends SoftDeleteEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    private TableStatus status;

    @Column(name = "position_x")
    private Double positionX;

    @Column(name = "position_y")
    private Double positionY;

    @Column(name = "zone")
    private String zone;
}