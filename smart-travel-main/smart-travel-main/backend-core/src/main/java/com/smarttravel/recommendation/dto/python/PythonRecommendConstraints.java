package com.smarttravel.recommendation.dto.python;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PythonRecommendConstraints(
        String budget,
        
        @JsonProperty("radius_km")
        double radiusKm,

        String category
) {
    @JsonProperty("radius_km")
    public double radiusKm() {
        return radiusKm;
    }
}
