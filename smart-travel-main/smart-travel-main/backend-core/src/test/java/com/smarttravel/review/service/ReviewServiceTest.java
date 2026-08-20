package com.smarttravel.review.service;

import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.review.dto.request.ReviewRequest;
import com.smarttravel.review.dto.response.ReviewResponse;
import com.smarttravel.review.entity.Rating;
import com.smarttravel.review.repository.RatingRepository;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock RatingRepository ratingRepository;
    @Mock PlaceRepository placeRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ReviewService reviewService;

    private UUID userId;
    private UUID placeId;
    private Place place;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        placeId = UUID.randomUUID();

        // Simulate authenticated user — same way JwtAuthenticationFilter sets principal
        var auth = new UsernamePasswordAuthenticationToken(userId, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        place = new Place();
        place.setId(placeId);

        user = User.builder()
                .id(userId)
                .name("Test User")
                .email("test@example.com")
                .build();
    }

    @Test
    void createReview_success() {
        when(ratingRepository.findByUser_IdAndPlace_Id(userId, placeId))
                .thenReturn(Optional.empty());
        when(placeRepository.findActiveById(placeId)).thenReturn(Optional.of(place));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Rating saved = buildSavedRating();
        when(ratingRepository.save(any())).thenReturn(saved);

        ReviewRequest req = new ReviewRequest();
        req.setRating(4);
        req.setTags(List.of("Sach se"));
        req.setComment("Rat thich!");

        ReviewResponse response = reviewService.createReview(placeId, req);

        assertThat(response.getRating()).isEqualTo(4);
        assertThat(response.getTags()).containsExactly("Sach se");
        assertThat(response.getComment()).isEqualTo("Rat thich!");

        // Verify exactly what was passed to save()
        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());
        assertThat(captor.getValue().getRatingPoint())
                .isEqualByComparingTo(BigDecimal.valueOf(4));
    }

    @Test
    void createReview_duplicateReview_throwsIllegalStateException() {
        when(ratingRepository.findByUser_IdAndPlace_Id(userId, placeId))
                .thenReturn(Optional.of(new Rating()));

        ReviewRequest req = new ReviewRequest();
        req.setRating(3);

        assertThatThrownBy(() -> reviewService.createReview(placeId, req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already reviewed");
    }

    @Test
    void createReview_placeNotFound_throwsResourceNotFoundException() {
        when(ratingRepository.findByUser_IdAndPlace_Id(userId, placeId))
                .thenReturn(Optional.empty());
        when(placeRepository.findActiveById(placeId)).thenReturn(Optional.empty());

        ReviewRequest req = new ReviewRequest();
        req.setRating(5);

        assertThatThrownBy(() -> reviewService.createReview(placeId, req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getReviews_placeNotFound_throwsResourceNotFoundException() {
        when(placeRepository.findActiveById(placeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.getReviews(placeId, 0, 10))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getReviews_returnsPagedResults() {
        when(placeRepository.findActiveById(placeId)).thenReturn(Optional.of(place));
        when(ratingRepository.findByPlace_IdAndDeletedAtIsNull(eq(placeId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(buildSavedRating())));

        var page = reviewService.getReviews(placeId, 0, 10);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getRating()).isEqualTo(4);
    }

    private Rating buildSavedRating() {
        Rating r = new Rating();
        r.setId(UUID.randomUUID());
        r.setPlace(place);
        r.setUser(user);
        r.setRatingPoint(BigDecimal.valueOf(4));
        r.setTags(List.of("Sach se"));
        r.setReviewContent("Rat thich!");
        r.setStatus("APPROVED");
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return r;
    }
}
