package com.smarttravel.user.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.auth.dto.ChangePasswordRequest;
import com.smarttravel.auth.service.AuthService;
import com.smarttravel.user.dto.UpdatePreferencesRequest;
import com.smarttravel.user.dto.UpdateProfileRequest;
import com.smarttravel.user.dto.UserPreferencesResponse;
import com.smarttravel.user.dto.UserProfileResponse;
import com.smarttravel.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for authenticated user profile operations.
 *
 * <p>All endpoints require a valid JWT (enforced by SecurityConfig → JwtAuthenticationFilter).
 * The user's UUID is extracted directly from the {@link Authentication} principal
 * (set by {@code JwtAuthenticationFilter} as the {@code UUID} object — no DB round-trip needed).
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    /**
     * GET /api/v1/users/me
     * Returns the currently authenticated user's full profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /**
     * PUT /api/v1/users/me
     * Partially updates the currently authenticated user's profile.
     * Only non-null request fields are applied.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    /**
     * PUT /api/v1/users/me/password
     * Changes the authenticated user's password.
     * Requires the correct current password (oldPassword).
     */
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        authService.changePassword(userId, request);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    /**
     * PUT /api/v1/users/me/preferences
     * Saves the authenticated user's onboarding preferences (interests + budget tier)
     * and marks onboarding as completed.
     */
    @PutMapping("/me/preferences")
    public ResponseEntity<UserPreferencesResponse> updateMyPreferences(
            Authentication auth,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(userService.updatePreferences(userId, request));
    }
}