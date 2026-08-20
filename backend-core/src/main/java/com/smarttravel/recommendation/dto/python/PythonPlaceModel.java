package com.smarttravel.recommendation.dto.python;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PythonPlaceModel(
    @JsonProperty("place_id")
    UUID placeId,
    Double score
) {
}