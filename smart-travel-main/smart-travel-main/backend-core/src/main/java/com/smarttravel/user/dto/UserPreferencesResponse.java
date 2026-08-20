package com.smarttravel.user.dto;

import java.util.List;

import com.smarttravel.user.entity.UserPreferences;

/**
 * Response DTO for PUT /api/v1/users/me/preferences
 */
public record UserPreferencesResponse(
        List<String> interests,
        String budget
) {
    public static UserPreferencesResponse from(UserPreferences prefs) {
        return new UserPreferencesResponse(
                prefs.getPreferredCategories(),
                prefs.getBudgetTier()
        );
    }
}