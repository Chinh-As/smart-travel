package com.smarttravel.review.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.entity.PlaceExternalStats;
import com.smarttravel.place.repository.PlaceExternalStatsRepository;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.review.dto.request.ReviewRequest;
import com.smarttravel.review.dto.response.ReviewResponse;
import com.smarttravel.review.entity.Rating;
import com.smarttravel.review.repository.RatingRepository;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;
import com.smarttravel.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final RatingRepository ratingRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final PlaceExternalStatsRepository placeExternalStatsRepository;
    private final NotificationService notificationService;

    /**
     * POST /api/v1/places/{placeId}/reviews
     * Creates a review. Throws IllegalStateException (→ 409) if user already reviewed this place.
     */
    @Transactional
    public ReviewResponse createReview(UUID placeId, ReviewRequest req) {
        UUID userId = getCurrentUserId();

        // Check duplicate before insert (second guard is the DB unique constraint)
        if (ratingRepository.findByUser_IdAndPlace_Id(userId, placeId).isPresent()) {
            throw new IllegalStateException("You have already reviewed this place. Use PUT to update your review.");
        }

        Place place = placeRepository.findActiveById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + placeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Rating rating = new Rating();
        rating.setPlace(place);
        rating.setUser(user);
        rating.setRatingPoint(BigDecimal.valueOf(req.getRating()));
        rating.setTags(req.getTags());
        rating.setReviewContent(req.getComment());
        rating.setStatus("APPROVED");

        Rating saved = ratingRepository.save(rating);

        // Side effect 1: Create notification for admin
        try {
            notificationService.createReviewNotification(user, place, saved);
        } catch (Exception e) {
            log.error("Failed to create review notification: {}", e.getMessage());
        }

        // Side effect 2: Update PlaceExternalStats
        updatePlaceUserStats(place);

        return toResponse(saved);
    }

    /**
     * GET /api/v1/places/{placeId}/reviews
     * Public — returns approved, non-deleted reviews for a place, newest first.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviews(UUID placeId, int page, int size) {
        // Verify place exists
        placeRepository.findActiveById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + placeId));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ratingRepository.findByPlace_IdAndDeletedAtIsNull(placeId, pageable)
                .map(this::toResponse);
    }

    // Legacy method support from feat/admin
    @Transactional
    public ReviewResponse saveReview(UUID userId, UUID placeId, BigDecimal ratingPoint, String reviewContent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Place place = placeRepository.findActiveById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));

        List<Rating> existingList = ratingRepository.searchReviews(null, user.getEmail(), Pageable.unpaged()).getContent();
        Rating rating = existingList.stream()
                .filter(r -> r.getPlace().getId().equals(place.getId()))
                .findFirst()
                .orElse(null);

        if (rating == null) {
            rating = new Rating();
            rating.setUser(user);
            rating.setPlace(place);
            rating.setCreatedAt(OffsetDateTime.now());
        }

        rating.setRatingPoint(ratingPoint);
        rating.setReviewContent(reviewContent);
        rating.setStatus("APPROVED");
        rating.setUpdatedAt(OffsetDateTime.now());

        Rating saved = ratingRepository.save(rating);

        try {
            notificationService.createReviewNotification(user, place, saved);
        } catch (Exception e) {
            log.error("Failed to create review notification: {}", e.getMessage());
        }

        updatePlaceUserStats(place);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByPlace(UUID placeId) {
        List<Rating> ratings = ratingRepository.findByPlaceIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(placeId, "APPROVED");
        return ratings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void updatePlaceUserStats(Place place) {
        try {
            List<Rating> ratings = ratingRepository.findByPlaceIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(place.getId(), "APPROVED");
            if (ratings.isEmpty()) return;

            double sum = 0;
            for (Rating r : ratings) {
                sum += r.getRatingPoint().doubleValue();
            }
            double avg = sum / ratings.size();

            PlaceExternalStats stats = placeExternalStatsRepository.findByPlaceIdAndSourceName(place.getId(), "USER")
                    .orElse(null);

            if (stats == null) {
                stats = PlaceExternalStats.builder()
                        .place(place)
                        .sourceName("USER")
                        .build();
            }

            stats.setRating(BigDecimal.valueOf(Math.round(avg * 10.0) / 10.0));
            stats.setReviewCount(ratings.size());
            stats.setFetchedAt(OffsetDateTime.now());

            placeExternalStatsRepository.save(stats);
        } catch (Exception e) {
            log.error("Failed to update place external stats for place {}: {}", place.getId(), e.getMessage());
        }
    }

    // --- Helpers ---

    private UUID getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID uuid) return uuid;
        throw new IllegalStateException("Cannot resolve authenticated user id");
    }

    private ReviewResponse toResponse(Rating r) {
        String name = r.getUser().getName();
        if (name == null || name.isBlank()) {
            name = r.getUser().getUsername();
        }
        if (name == null || name.isBlank()) {
            name = r.getUser().getEmail().split("@")[0];
        }

        return ReviewResponse.builder()
                .id(r.getId())
                .placeId(r.getPlace().getId())
                .userId(r.getUser().getId())
                .userEmail(r.getUser().getEmail())
                .userName(name)
                .rating(r.getRatingPoint() != null ? r.getRatingPoint().intValue() : 0)
                .ratingPoint(r.getRatingPoint())
                .tags(r.getTags())
                .comment(r.getReviewContent())
                .reviewContent(r.getReviewContent())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

