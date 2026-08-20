package com.smarttravel.category.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttravel.category.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByParentIsNull();

    java.util.Optional<Category> findByNameIgnoreCase(String name);

    List<Category> findByParentId(UUID parentId);

    Long countByIdIn(List<UUID> ids);

}
