package com.smarttravel.favorite.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smarttravel.favorite.entity.Favorite;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndPlaceId(UUID userId, UUID placeId);

    void deleteByUserIdAndPlaceId(UUID userId, UUID placeId);

    long countByUserId(UUID userId);
}
