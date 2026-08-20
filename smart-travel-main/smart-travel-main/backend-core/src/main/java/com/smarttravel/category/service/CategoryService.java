package com.smarttravel.category.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smarttravel.category.entity.Category;
import com.smarttravel.category.repository.CategoryRepository;
import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findByParentIsNull();
    }

    public Category findById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    public void validateIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        Long count = categoryRepository.countByIdIn(ids);

        if (!count.equals((long) ids.size())) {
            throw new BadRequestException("One or more category IDs are invalid");
        }
    }
    
}
