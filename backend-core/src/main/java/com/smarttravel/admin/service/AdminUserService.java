package com.smarttravel.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.admin.dto.ItineraryActivityDetail;
import com.smarttravel.admin.dto.ItineraryAdminResponse;
import com.smarttravel.admin.dto.ItineraryDetailAdminResponse;
import com.smarttravel.admin.dto.ReviewAdminResponse;
import com.smarttravel.admin.dto.ReviewStatusRequest;
import com.smarttravel.admin.dto.RoleUpdateRequest;
import com.smarttravel.admin.dto.UserAdminResponse;
import com.smarttravel.admin.dto.UserStatusRequest;
import com.smarttravel.auth.entity.UserAuth;
import com.smarttravel.auth.repository.RefreshTokenRepository;
import com.smarttravel.auth.repository.UserAuthRepository;
import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.itinerary.entity.Itinerary;
import com.smarttravel.itinerary.entity.ItineraryDay;
import com.smarttravel.itinerary.entity.ItineraryItem;
import com.smarttravel.itinerary.repository.ItineraryRepository;
import com.smarttravel.review.entity.Rating;
import com.smarttravel.review.repository.RatingRepository;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserAuthRepository userAuthRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;
    private final RatingRepository ratingRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public Page<UserAdminResponse> getUsers(String keyword, Pageable pageable) {
        Page<UserAuth> userAuths = userAuthRepository.searchUsers(keyword, pageable);
        return userAuths.map(ua -> new UserAdminResponse(
                ua.getUser().getId(),
                ua.getUser().getEmail(),
                ua.getUser().getName(),
                ua.getRole(),
                ua.getUser().getCreatedAt(),
                ua.getUser().getIsActive()
        ));
    }

    @Transactional
    public void updateUserStatus(UUID userId, UserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setIsActive(request.active());
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(UUID targetUserId, RoleUpdateRequest request, UUID currentUserId) {
        if (targetUserId.equals(currentUserId)) {
            throw new BadRequestException("Cannot change your own role.");
        }

        UserAuth userAuth = userAuthRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        userAuth.setRole(request.role());
        userAuthRepository.save(userAuth);

        // Revoke all existing refresh tokens to force re-login
        refreshTokenRepository.deleteByUserId(targetUserId);
    }

    @Transactional(readOnly = true)
    public Page<ItineraryAdminResponse> getItineraries(String keyword, Pageable pageable) {
        Page<Itinerary> itineraries = itineraryRepository.searchItineraries(keyword, pageable);
        return itineraries.map(i -> {
            int slotCount = 0;
            if (i.getDays() != null) {
                for (ItineraryDay day : i.getDays()) {
                    if (day.getItems() != null) {
                        slotCount += day.getItems().size();
                    }
                }
            }
            return new ItineraryAdminResponse(
                    i.getId(),
                    i.getUser() != null ? i.getUser().getId() : null,
                    i.getUser() != null ? i.getUser().getEmail() : "Unknown",
                    i.getCreatedAt(),
                    i.getStatus(),
                    slotCount
            );
        });
    }

    @Transactional(readOnly = true)
    public ItineraryDetailAdminResponse getItineraryDetails(UUID id) {
        Itinerary i = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found with id: " + id));

        int slotCount = 0;
        List<ItineraryActivityDetail> activities = new ArrayList<>();
        if (i.getDays() != null) {
            for (ItineraryDay day : i.getDays()) {
                if (day.getItems() != null) {
                    for (ItineraryItem item : day.getItems()) {
                        slotCount++;
                        activities.add(new ItineraryActivityDetail(
                                item.getStartTime(),
                                item.getEndTime(),
                                item.getPlace() != null ? item.getPlace().getName() : "Địa điểm khác",
                                item.getNote()
                        ));
                    }
                }
            }
        }

        return new ItineraryDetailAdminResponse(
                i.getId(),
                i.getUser() != null ? i.getUser().getId() : null,
                i.getUser() != null ? i.getUser().getEmail() : "Unknown",
                i.getCreatedAt(),
                i.getStatus(),
                slotCount,
                activities
        );
    }

    public Page<ReviewAdminResponse> getReviews(String status, String keyword, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.searchReviews(status, keyword, pageable);
        return ratings.map(r -> new ReviewAdminResponse(
                r.getId(),
                r.getUser() != null ? r.getUser().getEmail() : "Unknown",
                r.getPlace() != null ? r.getPlace().getName() : "Unknown",
                r.getRatingPoint() != null ? r.getRatingPoint().doubleValue() : 0.0,
                r.getReviewContent(),
                r.getStatus(),
                r.getCreatedAt()
        ));
    }

    @Transactional
    public void updateReviewStatus(UUID reviewId, ReviewStatusRequest request) {
        Rating rating = ratingRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        
        rating.setStatus(request.status());
        ratingRepository.save(rating);
    }
}
