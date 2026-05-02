package com.restaurant.platform.modules.menu.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.ResourceNotFoundException;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.common.service.MediaUrlService;
import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.dto.UpdateMenuItemRequest;
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
    private final MediaUrlService mediaUrlService;

    @Override
    public MenuItemResponse create(CreateMenuItemRequest request) {

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Category not found"));

        MenuItem item = mapper.toEntity(request);
        item.setCategory(category);
        item.setAvailable(true);

        return normalizeResponse(mapper.toResponse(menuRepo.save(item)));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MenuItemResponse> getAll(Pageable pageable) {

        Page<MenuItem> page = menuRepo.findAll(pageable);

        return new PageResponse<>(page.map(item -> normalizeResponse(mapper.toResponse(item))));
    }

    @Override
    public PageResponse<MenuItemResponse> search(String keyword, Pageable pageable) {

        Page<MenuItem> page =
                menuRepo.findByNameContainingIgnoreCase(keyword, pageable);

        return new PageResponse<>(page.map(item -> normalizeResponse(mapper.toResponse(item))));
    }

    @Override
    public PageResponse<MenuItemResponse> getByCategory(UUID categoryId, Pageable pageable) {
        Page<MenuItem> page = menuRepo.findByCategoryId(categoryId, pageable);
        return new PageResponse<>(page.map(item -> normalizeResponse(mapper.toResponse(item))));
    }

    @Override
    public MenuItemResponse getById(UUID id) {

        MenuItem item = menuRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Menu item not found"));

        return normalizeResponse(mapper.toResponse(item));
    }

    @Override
    public MenuItemResponse update(UUID id, UpdateMenuItemRequest request) {

        MenuItem item = menuRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.MENU_ITEM_NOT_FOUND, "Menu item not found"));

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.NOT_FOUND, "Category not found"));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        item.setPreparationTime(request.getPreparationTime());
        item.setCategory(category);
        item.setAvailable(request.getIsAvailable());

        return normalizeResponse(mapper.toResponse(menuRepo.save(item)));
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

    private MenuItemResponse normalizeResponse(MenuItemResponse response) {
        if (response == null) {
            return null;
        }

        response.setImageUrl(mediaUrlService.toPublicUrl(response.getImageUrl()));
        return response;
    }
}
