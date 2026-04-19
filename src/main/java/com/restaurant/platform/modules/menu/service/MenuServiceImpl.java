package com.restaurant.platform.modules.menu.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.entity.Category;
import com.restaurant.platform.modules.menu.entity.MenuItem;
import com.restaurant.platform.modules.menu.mapper.MenuMapper;
import com.restaurant.platform.modules.menu.repository.CategoryRepository;
import com.restaurant.platform.modules.menu.repository.MenuItemRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuRepo;
    private final CategoryRepository categoryRepo;
    private final MenuMapper mapper;

    @Override
    public MenuItemResponse create(CreateMenuItemRequest request) {

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Category not found"));

        MenuItem item = mapper.toEntity(request);
        item.setCategory(category);
        item.setAvailable(true);

        return mapper.toResponse(menuRepo.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MenuItemResponse> getAll(Pageable pageable) {

        Page<MenuItem> page = menuRepo.findAll(pageable);

        return new PageResponse<>(page.map(mapper::toResponse));
    }

    @Override
    public PageResponse<MenuItemResponse> search(String keyword, Pageable pageable) {

        Page<MenuItem> page =
                menuRepo.findByNameContainingIgnoreCase(keyword, pageable);

        return new PageResponse<>(page.map(mapper::toResponse));
    }

    @Override
    public PageResponse<MenuItemResponse> getByCategory(UUID categoryId, Pageable pageable) {
        Page<MenuItem> page = menuRepo.findByCategoryId(categoryId, pageable);
        return new PageResponse<>(page.map(mapper::toResponse));
    }

    @Override
    public MenuItemResponse getById(UUID id) {

        MenuItem item = menuRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Menu item not found"));

        return mapper.toResponse(item);
    }

    @Override
    public void delete(UUID id) {

        MenuItem item = menuRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Menu item not found"));

        item.setDeleted(true); // soft delete
        menuRepo.save(item);
    }

    @Override
    public void updateImage(UUID id, String imageUrl) {
        MenuItem item = menuRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Menu item not found"));
        
        item.setImageUrl(imageUrl);
        menuRepo.save(item);
    }
}