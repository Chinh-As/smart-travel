package com.smarttravel.user.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.auth.repository.UserAuthRepository;
import com.smarttravel.auth.entity.UserAuth;
import com.smarttravel.common.enums.Role;
import com.smarttravel.user.dto.UpdatePreferencesRequest;
import com.smarttravel.user.dto.UpdateProfileRequest;
import com.smarttravel.user.dto.UserPreferencesResponse;
import com.smarttravel.user.dto.UserProfileResponse;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.entity.UserPreferences;
import com.smarttravel.user.repository.UserPreferencesRepository;
import com.smarttravel.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserAuthRepository userAuthRepository;

    /**
     * Get the profile of the currently authenticated user.
     *
     * @param userId UUID from the JWT subject claim
     * @return UserProfileResponse containing all profile fields
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = findActiveUser(userId);
        Role role = userAuthRepository.findByUserId(userId)
                .map(UserAuth::getRole)
                .orElse(Role.USER);
        return UserProfileResponse.from(user, role);
    }

    /**
     * Partially update the current user's profile.
     * Only non-null fields in the request are applied (PATCH semantics over PUT route).
     *
     * @param userId  UUID from the JWT subject claim
     * @param request Partial update payload; null fields are ignored
     * @return Updated UserProfileResponse
     */
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findActiveUser(userId);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }

        if (request.username() != null) {
            String newUsername = request.username().trim();
            // Allow setting username to empty string = clearing it
            if (newUsername.isEmpty()) {
                user.setUsername(null);
            } else {
                if (newUsername.length() < 3) {
                    throw new BadRequestException("Username must be at least 3 characters");
                }
                // Ensure uniqueness, excluding the current user
                if (userRepository.existsByUsernameAndIdNot(newUsername, userId)) {
                    throw new BadRequestException("Username '" + newUsername + "' is already taken");
                }
                user.setUsername(newUsername);
            }
        }

        if (request.email() != null && !request.email().isBlank()) {
            String newEmail = request.email().trim().toLowerCase();
            // Only check uniqueness if the email is actually changing
            if (!newEmail.equals(user.getEmail())
                    && userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email '" + newEmail + "' is already in use");
            }
            user.setEmail(newEmail);
        }

        if (request.phone() != null) {
            user.setPhone(request.phone().trim().isEmpty() ? null : request.phone().trim());
        }

        if (request.bio() != null) {
            user.setBio(request.bio().trim().isEmpty() ? null : request.bio().trim());
        }

        User saved = userRepository.save(user);
        Role role = userAuthRepository.findByUserId(userId)
                .map(UserAuth::getRole)
                .orElse(Role.USER);
        return UserProfileResponse.from(saved, role);
    }

    /**
     * Save the current user's onboarding preferences (interests + budget tier).
     * Also marks onboarding as completed.
     *
     * @param userId  UUID from the JWT subject claim
     * @param request Interests list and budget tier
     * @return Saved preferences
     */
    @Transactional
    public UserPreferencesResponse updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        User user = findActiveUser(userId);

        UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> UserPreferences.builder().userId(userId).build());

        prefs.setPreferredCategories(request.interests());
        prefs.setBudgetTier(request.budget());

        UserPreferences saved = userPreferencesRepository.save(prefs);

        if (!Boolean.TRUE.equals(user.getHasCompletedOnboarding())) {
            user.setHasCompletedOnboarding(true);
            userRepository.save(user);
        }

        return UserPreferencesResponse.from(saved);
    }

    private User findActiveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Boolean.FALSE.equals(user.getIsActive()) || user.getDeletedAt() != null) {
            throw new ResourceNotFoundException("User not found");
        }
        return user;
    }
}