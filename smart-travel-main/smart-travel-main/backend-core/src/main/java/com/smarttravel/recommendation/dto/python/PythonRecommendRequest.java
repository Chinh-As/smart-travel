package com.smarttravel.recommendation.dto.python;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PythonRecommendRequest (
    PythonLocation location,
    PythonRecommendConstraints constraints,
    @JsonProperty("top_k")
    int topK
) {
    @JsonProperty("top_k")
    public int topK() {
        return topK;
    }
}