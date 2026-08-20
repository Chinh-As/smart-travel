package com.smarttravel.place.mapper;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

import com.smarttravel.place.dto.response.BasePlaceResponse;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.entity.PlaceExternalStats;

@Component
public class PlaceMapper {

    public BasePlaceResponse toResponse(Place place, Double userLat, Double userLng) {
        PlaceExternalStats bestStats = place.getExternalStats().stream()
                .filter(s -> s.getRating() != null)
                .max(Comparator.comparing(PlaceExternalStats::getRating))
                .orElse(null);

        Point geom = place.getGeom();
        Double placeLng = (geom != null) ? geom.getX() : null;
        Double placeLat = (geom != null) ? geom.getY() : null;

        Double distanceKm = null;
        if (userLat != null && userLng != null && placeLat != null && placeLng != null) {
            distanceKm = haversineKm(userLat, userLng, placeLat, placeLng);
        }

        List<String> categoryNames = place.getCategories().stream()
                .map(c -> c.getDisplayName() != null ? c.getDisplayName() : c.getName())
                .sorted()
                .collect(Collectors.toList());

        List<java.util.UUID> categoryIdList = place.getCategories().stream()
                .map(c -> c.getId())
                .collect(Collectors.toList());

        return BasePlaceResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .address(place.getAddress())
                .mainImageUrl(place.getMainImageUrl())
                .wheelchairAccess(place.getWheelchairAccess())
                .rating(bestStats != null && bestStats.getRating() != null
                        ? bestStats.getRating().doubleValue() : null)
                .reviewCount(bestStats != null ? bestStats.getReviewCount() : null)
                .priceLevel(bestStats != null ? bestStats.getPriceLevel() : null)
                .categories(categoryNames)
                .categoryIds(categoryIdList)
                .distanceKm(distanceKm != null ? round2(distanceKm) : null)
                .lat(placeLat)
                .lng(placeLng)
                .build();
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
