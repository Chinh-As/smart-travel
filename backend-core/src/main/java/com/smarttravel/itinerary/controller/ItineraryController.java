package com.smarttravel.itinerary.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.itinerary.dto.request.ItineraryGenerateRequest;
import com.smarttravel.itinerary.dto.request.ItinerarySaveRequest;
import com.smarttravel.itinerary.dto.response.ItineraryGenerateResponse;
import com.smarttravel.itinerary.dto.response.ItineraryResponse;
import com.smarttravel.itinerary.service.ItineraryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/itineraries")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/generate")
    public ResponseEntity<ItineraryGenerateResponse> generate(
        @Valid
        @RequestBody
        ItineraryGenerateRequest request
    ) {
        ItineraryGenerateResponse response = itineraryService.generate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ItineraryResponse>> getUserItineraries(
        @AuthenticationPrincipal UUID userId
    ) {
        List<ItineraryResponse> response = itineraryService.getUserItineraries(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ItineraryResponse> saveItinerary(
        @AuthenticationPrincipal UUID userId,
        @Valid @RequestBody ItinerarySaveRequest request
    ) {
        ItineraryResponse response = itineraryService.saveItinerary(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItineraryResponse> updateItinerary(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID id,
        @Valid @RequestBody ItinerarySaveRequest request
    ) {
        ItineraryResponse response = itineraryService.updateItinerary(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID id
    ) {
        itineraryService.deleteItinerary(userId, id);
        return ResponseEntity.noContent().build();
    }
}

