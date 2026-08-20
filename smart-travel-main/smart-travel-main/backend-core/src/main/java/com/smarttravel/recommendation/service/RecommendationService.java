package com.smarttravel.recommendation.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smarttravel.place.entity.Place;
import com.smarttravel.place.service.PlaceService;
import com.smarttravel.recommendation.client.RecommendationClient;
import com.smarttravel.recommendation.dto.request.RecommendationRequest;
import com.smarttravel.recommendation.dto.response.RecommendationPlaceResponse;
import com.smarttravel.recommendation.dto.response.RecommendationResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final PlaceService placeService;
    private final RecommendationClient recommendationClient;

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        List<Place> places = placeService.findByFilter(request);

        Map<UUID, Double> scoreMap = recommendationClient.getScores(places, request);

        List<RecommendationPlaceResponse> result = places.stream()
                .map(place -> toResponse(place, scoreMap, request))
                .sorted(Comparator.comparingDouble(
                        RecommendationPlaceResponse::getRecommendationScore).reversed())
                .limit(request.getTopK() != null ? request.getTopK() : 10)
                .toList();

        return RecommendationResponse.builder()
            .places(result)
            .totalCount(result.size())
            .build();
    }

    private RecommendationPlaceResponse toResponse(Place place, Map<UUID, Double> scoreMap, RecommendationRequest request) {
        return RecommendationPlaceResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .thumbnailUrl(place.getMainImageUrl())
                .wheelchairAccessible(place.getWheelchairAccess())

                .recommendationScore(scoreMap.getOrDefault(place.getId(), 0.0))
                .build();
    }
}
