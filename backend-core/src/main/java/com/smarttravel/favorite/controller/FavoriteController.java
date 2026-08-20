package com.smarttravel.favorite.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.favorite.dto.FavoriteRequest;
import com.smarttravel.favorite.dto.FavoriteResponse;
import com.smarttravel.favorite.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Get user's favorite places.
     * GET /api/favorites
     */
    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getFavorites(
            @AuthenticationPrincipal UUID userId
    ) {
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    /**
     * Add a place to favorites.
     * POST /api/favorites
     */
    @PostMapping
    public ResponseEntity<FavoriteResponse> addFavorite(
            @AuthenticationPrincipal UUID userId,
            @RequestBody @Valid FavoriteRequest request
    ) {
        FavoriteResponse response = favoriteService.addFavorite(userId, request.getPlaceId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Remove a place from favorites.
     * DELETE /api/favorites/{placeId}
     */
    @DeleteMapping("/{placeId}")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID placeId
    ) {
        favoriteService.removeFavorite(userId, placeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if a place is in favorites.
     * GET /api/favorites/check/{placeId}
     */
    @GetMapping("/check/{placeId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID placeId
    ) {
        boolean isFav = favoriteService.isFavorite(userId, placeId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }
}
