package com.restaurant.platform.modules.menu.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import com.restaurant.platform.modules.menu.entity.Category;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@SQLDelete(sql = "UPDATE menu_items SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Entity
@Table(name = "menu_items",
        indexes = {
                @Index(name = "idx_menu_category", columnList = "category_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MenuItem extends SoftDeleteEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String imageUrl;

    private Integer preparationTime; // phút

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private Boolean available;
}