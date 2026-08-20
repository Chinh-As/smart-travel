package com.smarttravel.admin.controller;

import com.smarttravel.admin.dto.AdminStatsResponse;
import com.smarttravel.favorite.repository.FavoriteRepository;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    @PersistenceContext
    private final EntityManager entityManager;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalPlaces = placeRepository.countActive();
        long totalUsers = userRepository.countActive();
        long totalFavorites = favoriteRepository.count();

        // Native SQL count for itineraries (since Itinerary has no JPA entity mapped)
        long totalItineraries = 0;
        try {
            totalItineraries = ((Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM itineraries WHERE deleted_at IS NULL"
            ).getSingleResult()).longValue();
        } catch (Exception e) {
            // Fallback if table doesn't exist or other query error
            totalItineraries = 0;
        }

        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalPlaces(totalPlaces)
                .totalUsers(totalUsers)
                .totalItineraries(totalItineraries)
                .totalFavorites(totalFavorites)
                .build();

        return ResponseEntity.ok(response);
    }
}
