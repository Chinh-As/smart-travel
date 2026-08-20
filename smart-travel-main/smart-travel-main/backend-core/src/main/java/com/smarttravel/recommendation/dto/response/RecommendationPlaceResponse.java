package com.smarttravel.recommendation.dto.response;

import com.smarttravel.common.enums.PriceRange;
import com.smarttravel.place.dto.response.BasePlaceResponse;

import lombok.experimental.SuperBuilder;
import lombok.Getter;

import java.util.List;

@Getter
@SuperBuilder
public class RecommendationPlaceResponse extends BasePlaceResponse {
    private Double distanceKm;

    private Double rating;
    private Integer reviewCount;

    private String thumbnailUrl;

    private String categoryName;

    private PriceRange priceRange;

    private Boolean wheelchairAccessible;

    private String openingHours;
    private Boolean openNow;

    private List<String> matchedTags;

    private Double recommendationScore;
}