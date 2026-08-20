package com.smarttravel.recommendation.client;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.smarttravel.category.service.CategoryService;
import com.smarttravel.place.entity.Place;
import com.smarttravel.recommendation.dto.python.PythonLocation;
import com.smarttravel.recommendation.dto.python.PythonPlaceModel;
import com.smarttravel.recommendation.dto.python.PythonRecommendConstraints;
import com.smarttravel.recommendation.dto.python.PythonRecommendRequest;
import com.smarttravel.recommendation.dto.python.PythonRecommendResponse;
import com.smarttravel.recommendation.dto.request.RecommendationRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RecommendationClient {

    private final RestClient recommendationRestClient;
    private final CategoryService categoryService;

    public Map<UUID, Double> getScores(List<Place> places, RecommendationRequest request) {
        PythonRecommendRequest pythonRequest = toPythonRequest(request, places.size());

        PythonRecommendResponse response = recommendationRestClient.post()
            .uri("/recommend")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .body(pythonRequest)
            .retrieve()
            .body(PythonRecommendResponse.class);

        if (response == null || response.places() == null) {
            return Map.of();
        }
        
        return response.places().stream()
            .filter(place -> place.placeId() != null)
            .collect(Collectors.toMap(
                PythonPlaceModel::placeId,
                place -> place.score() == null ? 0.0 : place.score(),
                Math::max
            ));
    }

    private PythonRecommendRequest toPythonRequest(RecommendationRequest request, int topK) {
        String categoryName;
        if (request.getConstraints().getCategoryId() != null) {
            categoryName = categoryService
                    .findById(request.getConstraints().getCategoryId())
                    .getName()
                    .toLowerCase();
        } else {
            categoryName = request.getConstraints().getCategory();
            if (categoryName == null) {
                throw new IllegalArgumentException("category or category_id must be provided");
            }
        }

        return new PythonRecommendRequest(
            toPythonLocation(request.getLocation()),
            new PythonRecommendConstraints(
                mapBudget(request.getConstraints().getBudget().getAmount()),
                request.getConstraints().getRadius(),
                categoryName
            ),
            Math.max(1, Math.min(topK, 50))
        );
    }

    private PythonLocation toPythonLocation(RecommendationRequest.Location location) {
        if (location instanceof RecommendationRequest.CoordinatesLocation coordinates) {
            return PythonLocation.coordinates(
                coordinates.getLat(),
                coordinates.getLng()
            );
        }

        if (location instanceof RecommendationRequest.CityLocation) {
            throw new IllegalArgumentException(
                "CITY lang is not supported yet. Please use COORDINATES location."
            );
        }

        throw new IllegalArgumentException("Unsupported location type");
    }

    private String mapBudget(Double amount) {
        if (amount == null) {
            return "medium";
        }

        if (amount <= 200_000) {
            return "low";
        }

        if (amount <= 1_000_000) {
            return "medium";
        }

        return "high";
    }
}
