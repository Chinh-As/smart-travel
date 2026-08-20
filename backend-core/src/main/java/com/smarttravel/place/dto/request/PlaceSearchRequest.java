package com.smarttravel.place.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.smarttravel.common.enums.SortBy;

@Getter
@Setter
@NoArgsConstructor
public class PlaceSearchRequest {
    private String keyword;

    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double lat;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double lng;

    private Double radiusKm = 5.0;

    private List<UUID> categoryIds;
    
    private String category;

    @Min(0)
    private Integer page = 0;

    @Min(1)
    @Max(1000)
    private Integer size = 10;

    private SortBy sortBy = SortBy.DISTANCE;

    @AssertTrue(message = "lat/lng must be provided together")
    public boolean isValidLatLng() {
        return (lat == null && lng == null) || (lat != null && lng != null);
    }

    @AssertTrue(message = "radiusKm must be provided when lat/lng exist")
    public boolean isValidRadiusKm() {
        if (lat != null && lng != null) {
            return radiusKm != null;
        }
        return true;
    }
}
