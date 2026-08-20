package com.smarttravel.itinerary.dto.response;

import java.time.LocalTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.smarttravel.place.dto.response.BasePlaceResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItemResponse {
    private UUID placeId;
    private String placeName;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    // Persistence fields
    private UUID id;
    private BasePlaceResponse place;
    private Integer orderIndex;
    private String note;
    private String timeSlot;
}

