package com.restaurant.platform.modules.menu.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@SQLDelete(sql = "UPDATE combos SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Entity
@Table(name = "combos")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Combo extends SoftDeleteEntity {

    private String name;

    private String description;

    private BigDecimal price;
}