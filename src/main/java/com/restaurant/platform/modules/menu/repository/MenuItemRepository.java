package com.restaurant.platform.modules.menu.repository;

import com.restaurant.platform.modules.menu.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    Page<MenuItem> findByCategoryId(UUID categoryId, Pageable pageable);

    Page<MenuItem> findByNameContainingIgnoreCase(String name, Pageable pageable);
}