package com.smarttravel.recommendation.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.smarttravel.common.enums.CurrencyCode;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RecommendationRequest {
    @NotNull (message = "Location information cannot be null")
    @Valid
    private Location location;

    @NotNull (message = "Constraints cannot be null")
    @Valid
    private Constraints constraints;

    @JsonProperty("prompt_text")
    private String promptText;
    @JsonProperty("top_k")
    private Integer topK = 10;
    
    @AssertTrue(message = "Invalid radius_km for selected location type")
    public boolean isValidCombination() {
        return validateLocationConstraints();
    }

    private boolean validateLocationConstraints() {
        if (location == null || constraints == null) {
            return true;
        }

        if (location instanceof CoordinatesLocation) {
            return constraints.getRadius() != null;
        }

        if (location instanceof CityLocation) {
            return constraints.getRadius() == null;
        }

        return true;
    }


    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
    @JsonSubTypes({
        @JsonSubTypes.Type(value = CoordinatesLocation.class, name = "COORDINATES"),
        @JsonSubTypes.Type(value = CityLocation.class, name = "CITY")
    })

    public static abstract class Location {
    }

    @Data
    @lombok.EqualsAndHashCode(callSuper = false)
    public static class CoordinatesLocation extends Location {
        @NotNull
        @DecimalMin(value = "-90.0", inclusive = true)
        @DecimalMax(value = "90.0", inclusive = true)
        private Double lat;

        @NotNull
        @DecimalMin(value = "-180.0", inclusive = true)
        @DecimalMax(value = "180.0", inclusive = true)
        private Double lng;
    }
    
    @Data
    @lombok.EqualsAndHashCode(callSuper = false)
    public static class CityLocation extends Location {
        @NotNull
        @Positive
        @JsonProperty("city_id")
        private UUID cityId;
    }

    @Data
    public static class Constraints {
        @Valid
        private Budget budget;

        @JsonProperty("needs_wheelchair")
        private Boolean wheelchairAccess;

        @Positive(message = "Radius must be greater than 0")
        @JsonProperty("radius_km")
        private Double radius;

        @JsonProperty("category_id")
        private UUID categoryId;
        
        @JsonProperty("category")
        private String category;
    }

    @Data
    public static class Budget {

        @NotNull(message = "Budget amount is required")
        @Positive(message = "Budget must be greater than 0")
        private Double amount;

        @NotNull
        private CurrencyCode currency;
    }

}