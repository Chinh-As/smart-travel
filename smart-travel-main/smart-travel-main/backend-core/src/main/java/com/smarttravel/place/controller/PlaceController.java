package com.smarttravel.place.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.place.dto.request.PlaceSaveRequest;
import com.smarttravel.place.dto.request.PlaceSearchRequest;
import com.smarttravel.place.dto.response.BasePlaceResponse;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.mapper.PlaceMapper;
import com.smarttravel.place.service.PlaceService;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
@Validated
public class PlaceController {

    private final PlaceService placeService;
    private final PlaceMapper placeMapper;

    @GetMapping("/search")
    public ResponseEntity<Page<BasePlaceResponse>> search(
            @Valid @ModelAttribute PlaceSearchRequest req
    ) {
        Page<Place> places = placeService.search(req);
        Page<BasePlaceResponse> response = places.map(
                place -> placeMapper.toResponse(place, req.getLat(), req.getLng())
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<BasePlaceResponse>> getFeatured(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "8") int size
    ) {
        PlaceSearchRequest req = new PlaceSearchRequest();
        req.setSortBy(com.smarttravel.common.enums.SortBy.RATING);
        req.setSize(size);
        req.setPage(0);
        
        Page<Place> places = placeService.search(req);
        Page<BasePlaceResponse> response = places.map(
                place -> placeMapper.toResponse(place, null, null)
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BasePlaceResponse> getById(@PathVariable UUID id) {
        Place place = placeService.findById(id);
        return ResponseEntity.ok(placeMapper.toResponse(place, null, null));
    }

    @PostMapping
    public ResponseEntity<BasePlaceResponse> create(@Valid @RequestBody PlaceSaveRequest req) {
        Place place = placeService.createPlace(req);
        return ResponseEntity.ok(placeMapper.toResponse(place, null, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BasePlaceResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlaceSaveRequest req
    ) {
        Place place = placeService.updatePlace(id, req);
        return ResponseEntity.ok(placeMapper.toResponse(place, null, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        placeService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }
}
