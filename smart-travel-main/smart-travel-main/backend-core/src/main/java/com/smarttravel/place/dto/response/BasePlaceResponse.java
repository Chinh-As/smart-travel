package com.smarttravel.place.dto.response;


import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class BasePlaceResponse {

    private UUID id;
    private String name;
    private String address;
    private String mainImageUrl;
    private Boolean wheelchairAccess;

    private Double rating;
    private Integer reviewCount;
    private String priceLevel;      // "low" | "medium" | "high"

    private List<String> categories;
    private List<UUID> categoryIds;

    private Double distanceKm;

    private Double lat;
    private Double lng;
}