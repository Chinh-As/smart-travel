package com.smarttravel.favorite.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.favorite.dto.FavoriteResponse;
import com.smarttravel.favorite.entity.Favorite;
import com.smarttravel.favorite.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public List<FavoriteResponse> getFavorites(UUID userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FavoriteResponse addFavorite(UUID userId, UUID placeId) {
        if (favoriteRepository.existsByUserIdAndPlaceId(userId, placeId)) {
            throw new IllegalStateException("Địa điểm này đã được thêm vào danh sách yêu thích.");
        }
        Favorite favorite = Favorite.builder()
                .userId(userId)
                .placeId(placeId)
                .build();
        return toResponse(favoriteRepository.save(favorite));
    }

    @Transactional
    public void removeFavorite(UUID userId, UUID placeId) {
        if (!favoriteRepository.existsByUserIdAndPlaceId(userId, placeId)) {
            throw new NoSuchElementException("Không tìm thấy mục yêu thích để xóa.");
        }
        favoriteRepository.deleteByUserIdAndPlaceId(userId, placeId);
    }

    public boolean isFavorite(UUID userId, UUID placeId) {
        return favoriteRepository.existsByUserIdAndPlaceId(userId, placeId);
    }

    private FavoriteResponse toResponse(Favorite favorite) {
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .userId(favorite.getUserId())
                .placeId(favorite.getPlaceId())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
