package com.restaurant.platform.modules.menu.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('MENU_CREATE')")
    public ApiResponse<MenuItemResponse> create(
            @Valid @RequestBody CreateMenuItemRequest request
    ) {
        return ApiResponse.success(menuService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ApiResponse<PageResponse<MenuItemResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(menuService.getAll(pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<MenuItemResponse>> search(
            @RequestParam String keyword,
            Pageable pageable
    ) {
        return ApiResponse.success(menuService.search(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuItemResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(menuService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('MENU_DELETE')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        menuService.delete(id);
        return ApiResponse.successMessage("Deleted successfully");
    }
}