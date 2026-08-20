package com.smarttravel.user.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request body for PUT /api/v1/users/me/preferences
 */
public record UpdatePreferencesRequest(

        @NotNull(message = "Interests are required")
        List<String> interests,

        @NotNull(message = "Budget is required")
        @Pattern(regexp = "save|mid|high", message = "Budget must be one of: save, mid, high")
        String budget

) {}