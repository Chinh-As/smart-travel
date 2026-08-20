package com.smarttravel.admin.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record AdminRecommendTestRequest(
        @NotNull(message = "User ID is required")
        UUID userId,
        Double lat,
        Double lng,
        int limit,
        Double radiusKm,
        String budget,
        String category
) {}

