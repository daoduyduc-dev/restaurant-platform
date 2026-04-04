package com.restaurant.platform.modules.menu.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.menu.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ApiResponse<Object> getAll() {
        return ApiResponse.success(categoryRepository.findAll());
    }
}
