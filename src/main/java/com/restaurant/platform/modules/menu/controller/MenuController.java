package com.restaurant.platform.modules.menu.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.common.response.PageResponse;
import com.restaurant.platform.common.service.FileStorageService;
import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final FileStorageService fileStorageService;

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

    @GetMapping("/category/{categoryId}")
    public ApiResponse<PageResponse<MenuItemResponse>> getByCategory(
            @PathVariable UUID categoryId,
            Pageable pageable
    ) {
        return ApiResponse.success(menuService.getByCategory(categoryId, pageable));
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

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for menu item")
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE', 'ADMIN')")
    public ApiResponse<Map<String, String>> uploadImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        String fileName = fileStorageService.storeMenuItemImage(file);
        String imageUrl = "/uploads/menu-items/" + fileName;
        
        // Update menu item with image URL
        menuService.updateImage(id, imageUrl);
        
        return ApiResponse.success(Map.of(
                "fileName", fileName,
                "imageUrl", imageUrl,
                "message", "Image uploaded successfully"
        ));
    }
}