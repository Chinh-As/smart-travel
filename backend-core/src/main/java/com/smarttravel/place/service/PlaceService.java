package com.smarttravel.place.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.category.entity.Category;
import com.smarttravel.category.repository.CategoryRepository;
import com.smarttravel.category.service.CategoryService;
import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.place.dto.request.PlaceSaveRequest;
import com.smarttravel.place.dto.request.PlaceSearchRequest;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.entity.PlaceExternalStats;
import com.smarttravel.place.repository.PlaceExternalStatsRepository;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.recommendation.dto.request.RecommendationRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private final PlaceRepository placeRepository;
    private final CategoryRepository categoryRepository;
    private final PlaceExternalStatsRepository placeExternalStatsRepository;
    private final CategoryService categoryService;

    public Page<Place> search(PlaceSearchRequest req) {
        List<UUID> finalCategoryIds = req.getCategoryIds() != null ? new java.util.ArrayList<>(req.getCategoryIds()) : new java.util.ArrayList<>();
        if (req.getCategory() != null && !req.getCategory().isEmpty()) {
            categoryRepository.findByNameIgnoreCase(req.getCategory())
                .ifPresent(cat -> finalCategoryIds.add(cat.getId()));
        }
        categoryService.validateIds(finalCategoryIds);

        String categoryIdsParam = toPostgresArray(finalCategoryIds);

        boolean hasLocation = req.getLat() != null;
        double lat = hasLocation ? req.getLat() : 0.0;
        double lng = hasLocation ? req.getLng() : 0.0;
        double radiusMeters = hasLocation ? req.getRadiusKm() * 1000.0 : 0.0;

        Pageable pageable = PageRequest.of(req.getPage(), req.getSize());

        return switch (req.getSortBy()) {
            case RATING -> placeRepository.searchSortByRating(
                    req.getKeyword(), hasLocation, lat, lng,
                    radiusMeters, categoryIdsParam, pageable);

            case PRICE -> placeRepository.searchSortByPrice(
                    req.getKeyword(), hasLocation, lat, lng,
                    radiusMeters, categoryIdsParam, pageable);

            default -> placeRepository.searchSortByDistance(
                    req.getKeyword(), hasLocation, lat, lng,
                    radiusMeters, categoryIdsParam, pageable);
        };
    }

    public Place findById(UUID id) {
        return placeRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + id));
    }

    @Transactional
    public Place createPlace(PlaceSaveRequest request) {
        if (request.getCategoryIds() != null) {
            categoryService.validateIds(request.getCategoryIds());
        }

        Place place = Place.builder()
                .cityId(request.getCityId())
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .geom(GEOMETRY_FACTORY.createPoint(new Coordinate(request.getLng(), request.getLat())))
                .mainImageUrl(request.getMainImageUrl())
                .wheelchairAccess(request.getWheelchairAccess())
                .rawOpeningHours(request.getRawOpeningHours())
                .build();

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            place.setCategories(new HashSet<>(categories));
        }

        Place savedPlace = placeRepository.save(place);

        if (request.getRating() != null || request.getReviewCount() != null || request.getPriceLevel() != null) {
            BigDecimal ratingDec = request.getRating() != null ? BigDecimal.valueOf(request.getRating()) : null;
            PlaceExternalStats stats = PlaceExternalStats.builder()
                    .place(savedPlace)
                    .sourceName("ADMIN")
                    .rating(ratingDec)
                    .reviewCount(request.getReviewCount())
                    .priceLevel(request.getPriceLevel())
                    .fetchedAt(OffsetDateTime.now())
                    .build();
            placeExternalStatsRepository.save(stats);
            savedPlace.getExternalStats().add(stats);
        }

        return savedPlace;
    }

    @Transactional
    public Place updatePlace(UUID id, PlaceSaveRequest request) {
        Place place = findById(id);

        if (request.getCategoryIds() != null) {
            categoryService.validateIds(request.getCategoryIds());
        }

        place.setCityId(request.getCityId());
        place.setName(request.getName());
        place.setDescription(request.getDescription());
        place.setAddress(request.getAddress());
        place.setGeom(GEOMETRY_FACTORY.createPoint(new Coordinate(request.getLng(), request.getLat())));
        place.setMainImageUrl(request.getMainImageUrl());
        place.setWheelchairAccess(request.getWheelchairAccess());
        place.setRawOpeningHours(request.getRawOpeningHours());

        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            place.setCategories(new HashSet<>(categories));
        } else {
            place.getCategories().clear();
        }

        Place savedPlace = placeRepository.save(place);

        BigDecimal ratingDec = request.getRating() != null ? BigDecimal.valueOf(request.getRating()) : null;
        Optional<PlaceExternalStats> existingStats = placeExternalStatsRepository.findByPlaceIdAndSourceName(id, "ADMIN");

        if (existingStats.isPresent()) {
            PlaceExternalStats stats = existingStats.get();
            stats.setRating(ratingDec);
            stats.setReviewCount(request.getReviewCount());
            stats.setPriceLevel(request.getPriceLevel());
            stats.setFetchedAt(OffsetDateTime.now());
            placeExternalStatsRepository.save(stats);
        } else if (request.getRating() != null || request.getReviewCount() != null || request.getPriceLevel() != null) {
            PlaceExternalStats stats = PlaceExternalStats.builder()
                    .place(savedPlace)
                    .sourceName("ADMIN")
                    .rating(ratingDec)
                    .reviewCount(request.getReviewCount())
                    .priceLevel(request.getPriceLevel())
                    .fetchedAt(OffsetDateTime.now())
                    .build();
            placeExternalStatsRepository.save(stats);
            savedPlace.getExternalStats().add(stats);
        }

        return savedPlace;
    }

    @Transactional
    public void deletePlace(UUID id) {
        Place place = findById(id);
        place.setDeletedAt(OffsetDateTime.now());
        placeRepository.save(place);
    }

    private String toPostgresArray(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return null;
        String joined = ids.stream()
                .map(UUID::toString)
                .collect(Collectors.joining(","));
        return "{" + joined + "}";
    }

    public List<Place> findByFilter(RecommendationRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findByFilter'");
    }
}
