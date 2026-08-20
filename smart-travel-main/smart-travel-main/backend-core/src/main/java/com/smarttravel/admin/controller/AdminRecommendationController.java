package com.smarttravel.admin.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import com.smarttravel.admin.dto.AdminRecommendTestRequest;
import com.smarttravel.admin.dto.AdminRecommendTestResultItem;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.recommendation.dto.python.PythonLocation;
import com.smarttravel.recommendation.dto.python.PythonPlaceModel;
import com.smarttravel.recommendation.dto.python.PythonRecommendConstraints;
import com.smarttravel.recommendation.dto.python.PythonRecommendRequest;
import com.smarttravel.recommendation.dto.python.PythonRecommendResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRecommendationController {

    private final PlaceRepository placeRepository;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Value("${recommendation.service.url}")
    private String recommendationServiceUrl;

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testRecommendation(@Valid @RequestBody AdminRecommendTestRequest request) {
        double lat = request.lat() != null ? request.lat() : 10.7769;
        double lng = request.lng() != null ? request.lng() : 106.7009;
        double radiusKm = request.radiusKm() != null ? request.radiusKm() : 50.0;
        int limit = Math.max(1, Math.min(request.limit() > 0 ? request.limit() : 10, 50));
        String budget = request.budget() != null ? request.budget() : "medium";
        String category = request.category() != null ? request.category() : "tourist_attraction";

        // 1. Fetch candidate places from DB near coordinates
        List<Place> places = placeRepository.searchSortByDistance(
                null, true, lat, lng, radiusKm * 1000,
                null, PageRequest.of(0, Math.max(limit * 3, 30))
        ).getContent();

        log.info("[ADMIN RECOMMENDATION TEST] Testing for user: {} - DB returned {} places within {}km of ({},{}). URL: {}/recommend",
                request.userId(), places.size(), radiusKm, lat, lng, recommendationServiceUrl);

        // 2. Try Python service — graceful fallback if unavailable
        Map<UUID, Double> scoreMap = Map.of();
        boolean pythonAvailable = false;
        String pythonWarning = null;

        if (!places.isEmpty()) {
            PythonRecommendRequest pythonRequest = new PythonRecommendRequest(
                    PythonLocation.coordinates(lat, lng),
                    new PythonRecommendConstraints(budget, radiusKm, category),
                    limit
            );
            try {
                log.info("[ADMIN RECOMMENDATION TEST] Sending to Python: {}", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(pythonRequest));
                PythonRecommendResponse pythonResponse = restClient.post()
                        .uri("/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .body(pythonRequest)
                        .retrieve()
                        .body(PythonRecommendResponse.class);

                if (pythonResponse != null && pythonResponse.places() != null) {
                    scoreMap = pythonResponse.places().stream()
                            .filter(p -> p.placeId() != null)
                            .collect(Collectors.toMap(
                                    PythonPlaceModel::placeId,
                                    p -> p.score() != null ? p.score() : 0.0,
                                    Math::max
                            ));
                    pythonAvailable = true;
                    log.info("[ADMIN RECOMMENDATION TEST] Python returned {} scored places", scoreMap.size());
                }
            } catch (ResourceAccessException e) {
                pythonWarning = "Recommendation service (cổng 5000) không khả dụng — kết quả được sắp xếp theo khoảng cách.";
                log.warn("[ADMIN RECOMMENDATION TEST] Python service unreachable: {}", e.getMessage());
            } catch (Exception e) {
                pythonWarning = "Lỗi AI service: " + e.getMessage();
                log.error("[ADMIN RECOMMENDATION TEST] Error calling Python: {}", e.getMessage(), e);
            }
        }

        // 3. Build result list
        final double maxScore = scoreMap.values().stream().mapToDouble(Double::doubleValue).max().orElse(1.0);
        final double normalizer = maxScore > 0 ? maxScore : 1.0;

        List<AdminRecommendTestResultItem> results = new ArrayList<>();
        for (Place place : places) {
            double score = scoreMap.getOrDefault(place.getId(), 0.0);
            double scorePercent = (score / normalizer) * 100.0;
            double distanceKm = computeDistanceKm(lat, lng, place.getGeom());
            String categoryName = place.getCategories().stream()
                    .findFirst()
                    .map(c -> c.getDisplayName() != null ? c.getDisplayName() : c.getName())
                    .orElse("Chưa phân loại");

            results.add(new AdminRecommendTestResultItem(
                    place.getId(),
                    place.getName(),
                    place.getAddress(),
                    categoryName,
                    score,
                    Math.round(scorePercent * 10.0) / 10.0,
                    Math.round(distanceKm * 10.0) / 10.0
            ));
        }

        // 4. Sort by AI score (desc) when available, else by distance (asc)
        if (pythonAvailable) {
            results.sort(Comparator.comparingDouble(AdminRecommendTestResultItem::score).reversed());
        } else {
            results.sort(Comparator.comparingDouble(AdminRecommendTestResultItem::distanceKm));
        }

        List<AdminRecommendTestResultItem> topResults = results.stream().limit(limit).toList();

        // 5. Return envelope with metadata
        Map<String, Object> envelope = new LinkedHashMap<>();
        envelope.put("items", topResults);
        envelope.put("totalFound", topResults.size());
        envelope.put("pythonAvailable", pythonAvailable);
        if (pythonWarning != null) {
            envelope.put("pythonWarning", pythonWarning);
        }

        log.info("[ADMIN RECOMMENDATION TEST] Returning {} results, pythonAvailable={}", topResults.size(), pythonAvailable);
        return ResponseEntity.ok(envelope);
    }

    private double computeDistanceKm(double lat1, double lng1, Point geom) {
        if (geom == null) return 0.0;
        double lat2 = geom.getY();
        double lng2 = geom.getX();
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
