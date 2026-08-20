package com.smarttravel.user.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.smarttravel.user.entity.User;
import com.smarttravel.common.enums.Role;

/**
 * Response DTO for GET /api/v1/users/me
 */
public record UserProfileResponse(
        UUID id,
        String name,
        String username,
        String email,
        String phone,
        String bio,
        Boolean hasCompletedOnboarding,
        Role role,
        OffsetDateTime createdAt
) {
    public static UserProfileResponse from(User user, Role role) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getBio(),
                user.getHasCompletedOnboarding(),
                role,
                user.getCreatedAt()
        );
    }
}
