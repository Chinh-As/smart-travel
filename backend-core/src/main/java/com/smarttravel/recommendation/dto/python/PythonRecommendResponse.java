package com.smarttravel.recommendation.dto.python;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PythonRecommendResponse(
    List<PythonPlaceModel> places,

    @JsonProperty("total_count")
    int totalCount,

    @JsonProperty("radius_used")
    double radius_used
) {
}