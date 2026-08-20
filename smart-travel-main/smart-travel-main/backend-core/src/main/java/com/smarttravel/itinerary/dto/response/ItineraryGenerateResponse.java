package com.smarttravel.itinerary.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ItineraryGenerateResponse {

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate date;

    private List<ItineraryItemResponse> items;

    private List<UUID> unscheduledPlaceIds;

}
