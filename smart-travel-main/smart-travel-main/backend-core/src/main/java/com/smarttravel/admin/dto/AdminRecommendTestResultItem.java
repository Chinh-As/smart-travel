package com.smarttravel.admin.dto;

import java.util.UUID;

public record AdminRecommendTestResultItem(
        UUID placeId,
        String placeName,
        String address,
        String category,
        Double score,
        Double scorePercent,
        Double distanceKm
) {}
