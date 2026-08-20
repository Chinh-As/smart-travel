package com.smarttravel.recommendation.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.place.entity.Place;
import com.smarttravel.recommendation.client.RecommendationClient;
import com.smarttravel.recommendation.dto.request.RecommendationRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Profile("dev")
public class RecommendationTestController {

    private final RecommendationClient recommendationClient;

    @PostMapping("/api/dev/recommendation/scores")
    public Object getScores(@RequestBody RecommendationRequest request) {
        try {
            List<Place> dummyPlaces = List.of(
                    Place.builder().id(UUID.randomUUID()).name("Dummy 1").build(),
                    Place.builder().id(UUID.randomUUID()).name("Dummy 2").build(),
                    Place.builder().id(UUID.randomUUID()).name("Dummy 3").build(),
                    Place.builder().id(UUID.randomUUID()).name("Dummy 4").build(),
                    Place.builder().id(UUID.randomUUID()).name("Dummy 5").build()
            );

            return recommendationClient.getScores(dummyPlaces, request);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of(
                    "error", e.getClass().getName(),
                    "message", e.getMessage()
            );
        }
   }
}