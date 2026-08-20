package com.smarttravel.review.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.review.dto.request.ReviewRequest;
import com.smarttravel.review.dto.request.ReviewSaveRequest;
import com.smarttravel.review.dto.response.ReviewResponse;
import com.smarttravel.review.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/v1/places/{placeId}/reviews
     * Requires authentication. Returns 409 if the user already reviewed this place.
     */
    @PostMapping("/api/v1/places/{placeId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable UUID placeId,
            @Valid @RequestBody ReviewRequest req
    ) {
        ReviewResponse response = reviewService.createReview(placeId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/places/{placeId}/reviews
     * Public. Returns paginated reviews sorted by newest first.
     */
    @GetMapping("/api/v1/places/{placeId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable UUID placeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(reviewService.getReviews(placeId, page, size));
    }

    /**
     * POST /api/v1/reviews
     * Legacy endpoint from feat/admin.
     */
    @PostMapping("/api/v1/reviews")
    public ResponseEntity<ReviewResponse> saveReview(
            Authentication auth,
            @Valid @RequestBody ReviewSaveRequest request
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        ReviewResponse response = reviewService.saveReview(userId, request.placeId(), request.ratingPoint(), request.reviewContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/reviews/places/{placeId}
     * Legacy endpoint from feat/admin.
     */
    @GetMapping("/api/v1/reviews/places/{placeId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByPlace(@PathVariable UUID placeId) {
        return ResponseEntity.ok(reviewService.getReviewsByPlace(placeId));
    }
}
