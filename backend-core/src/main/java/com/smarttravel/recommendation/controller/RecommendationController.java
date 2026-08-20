package com.smarttravel.recommendation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.recommendation.dto.request.RecommendationRequest;
import com.smarttravel.recommendation.dto.response.RecommendationResponse;
import com.smarttravel.recommendation.service.RecommendationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/recommendation")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @PostMapping
    public ResponseEntity<RecommendationResponse> getRecommendations(
        @Valid
        @RequestBody
        RecommendationRequest request 
    ) {
        return ResponseEntity.ok(recommendationService.getRecommendations(request));
    }
}
