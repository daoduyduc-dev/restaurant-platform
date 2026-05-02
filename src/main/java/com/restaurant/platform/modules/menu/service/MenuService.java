package com.restaurant.platform.modules.menu.service;

import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.dto.UpdateMenuItemRequest;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MenuService {

    MenuItemResponse create(CreateMenuItemRequest request);

    PageResponse<MenuItemResponse> getAll(Pageable pageable);

    PageResponse<MenuItemResponse> search(String keyword, Pageable pageable);

    PageResponse<MenuItemResponse> getByCategory(UUID categoryId, Pageable pageable);

    MenuItemResponse getById(UUID id);

    MenuItemResponse update(UUID id, UpdateMenuItemRequest request);

    void delete(UUID id);

    void updateImage(UUID id, String imageUrl);
}
