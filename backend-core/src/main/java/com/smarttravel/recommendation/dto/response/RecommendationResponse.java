package com.smarttravel.recommendation.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecommendationResponse {
    private List<String> extractedTags;
    
    private List<RecommendationPlaceResponse> places;

    private Integer totalCount;

}