package com.smarttravel.category.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.category.entity.Category;
import com.smarttravel.category.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryDto> dtos = categories.stream()
                .map(c -> new CategoryDto(
                        c.getId().toString(),
                        c.getName(),
                        c.getDisplayName() != null ? c.getDisplayName() : c.getName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public record CategoryDto(String id, String name, String displayName) {}
}
