package com.restaurant.platform.modules.menu.entity;

import com.restaurant.platform.common.base.SoftDeleteEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@SQLDelete(sql = "UPDATE categories SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Entity
@Table(name = "categories")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Category extends SoftDeleteEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
    
    private String icon;
    
    private String color;
    
    private Integer sortOrder;
}